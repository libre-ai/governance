import { expect, type Page, test } from "@playwright/test";

type VectorKdf = {
  algorithm: string;
  version: number;
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  outputLengthBytes: number;
  salt: string;
};

type Vectors = {
  golden: {
    request: {
      schemaVersion: string;
      id: string;
      cipher: string;
      kdf: VectorKdf;
      nonce: string;
      plaintext: string;
    };
    recoverySecret: { hex: string };
    plaintext: { base64: string };
    canonicalEnvelopeUtf8: string;
  };
  contextCanonicalization: {
    golden: { inputUtf8: string; canonicalOutputUtf8: string };
  };
};

async function blockExternalRequests(page: Page, blocked: string[]): Promise<void> {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && url.port === "41773") await route.continue();
    else {
      blocked.push(url.origin);
      await route.abort("blockedbyclient");
    }
  });
}

test("destroys isolated component instances after traps, OOM, and timeout", async ({ page }) => {
  const blockedRequests: string[] = [];
  const consoleMessages: string[] = [];
  const pageErrors: string[] = [];
  await blockExternalRequests(page, blockedRequests);
  page.on("console", (message) => consoleMessages.push(`${message.type()}:${message.text()}`));
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const isolationUrl = "/generated/isolated-host.js";
    const isolation = (await import(isolationUrl)) as typeof import("./isolated-host");
    const vectors = (await (await fetch("/golden-vectors.json")).json()) as Vectors;
    const encoder = new TextEncoder();
    const fromBase64 = (value: string): Uint8Array =>
      Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
    const fromHex = (value: string): Uint8Array => {
      const output = new Uint8Array(value.length / 2);
      for (let index = 0; index < output.length; index += 1) {
        output[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
      }
      return output;
    };
    const sha256 = async (value: Uint8Array): Promise<string> => {
      const copy = new Uint8Array(value.length);
      copy.set(value);
      try {
        const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", copy.buffer));
        return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      } finally {
        copy.fill(0);
      }
    };
    const sealOperation = () => {
      const request = vectors.golden.request;
      return {
        kind: "seal" as const,
        recoverySecret: fromHex(vectors.golden.recoverySecret.hex),
        request: {
          schemaVersion: request.schemaVersion,
          id: request.id,
          cipher: request.cipher,
          kdf: {
            algorithm: request.kdf.algorithm,
            version: request.kdf.version,
            memoryKib: request.kdf.memoryKiB,
            iterations: request.kdf.iterations,
            parallelism: request.kdf.parallelism,
            outputLengthBytes: request.kdf.outputLengthBytes,
            salt: fromBase64(request.kdf.salt),
          },
          nonce: fromBase64(request.nonce),
          plaintext: fromBase64(request.plaintext),
        },
      };
    };
    const openOperation = () => ({
      envelope: encoder.encode(vectors.golden.canonicalEnvelopeUtf8),
      kind: "open-digest" as const,
      recoverySecret: fromHex(vectors.golden.recoverySecret.hex),
    });
    const canonicalizeOperation = () => ({
      document: encoder.encode(vectors.contextCanonicalization.golden.inputUtf8),
      kind: "canonicalize" as const,
    });
    const operation = {
      canonicalize: canonicalizeOperation,
      "open-digest": openOperation,
      seal: sealOperation,
    };
    const expectRefusal = async (
      promise: Promise<unknown>,
    ): Promise<{ code?: string; message?: string }> => {
      try {
        await promise;
        return { code: "accepted" };
      } catch (error) {
        return {
          code: (error as { code?: string }).code,
          message: (error as { message?: string }).message,
        };
      }
    };

    const expected = {
      canonicalize: await sha256(
        encoder.encode(vectors.contextCanonicalization.golden.canonicalOutputUtf8),
      ),
      "open-digest": await sha256(fromBase64(vectors.golden.plaintext.base64)),
      seal: await sha256(encoder.encode(vectors.golden.canonicalEnvelopeUtf8)),
    };
    const successFailures: string[] = [];
    for (const kind of ["canonicalize", "seal", "open-digest"] as const) {
      const owned = operation[kind]();
      const summary = await isolation.runIsolatedOperation(owned);
      if (summary.outputSha256 !== expected[kind] || summary.outputLength < 1) {
        successFailures.push(kind);
      }
      const views =
        owned.kind === "canonicalize"
          ? [owned.document]
          : owned.kind === "seal"
            ? [
                owned.request.kdf.salt,
                owned.request.nonce,
                owned.request.plaintext,
                owned.recoverySecret,
              ]
            : [owned.envelope, owned.recoverySecret];
      if (!views.every((view) => view.byteLength === 0)) successFailures.push(`${kind}-ownership`);
    }

    const faultFailures: string[] = [];
    for (const fault of ["trap", "oom"] as const) {
      for (const kind of ["canonicalize", "seal", "open-digest"] as const) {
        const owned = operation[kind]();
        const refusal = await expectRefusal(isolation.runIsolatedOperation(owned, { fault }));
        const expectedCode = fault === "oom" ? "resource-limit-exceeded" : "internal-failure";
        const expectedMessage =
          fault === "oom" ? "Backup operation unavailable." : "Backup operation failed.";
        const views =
          owned.kind === "canonicalize"
            ? [owned.document]
            : owned.kind === "seal"
              ? [
                  owned.request.kdf.salt,
                  owned.request.nonce,
                  owned.request.plaintext,
                  owned.recoverySecret,
                ]
              : [owned.envelope, owned.recoverySecret];
        if (
          refusal.code !== expectedCode ||
          refusal.message !== expectedMessage ||
          !views.every((view) => view.byteLength === 0)
        ) {
          faultFailures.push(`${fault}-${kind}`);
        }
      }
    }

    const hung = openOperation();
    const timeout = await expectRefusal(
      isolation.runIsolatedOperation(hung, { fault: "hang", timeoutMs: 1_000 }),
    );
    if (
      timeout.code !== "resource-limit-exceeded" ||
      timeout.message !== "Backup operation unavailable." ||
      hung.envelope.byteLength !== 0 ||
      hung.recoverySecret.byteLength !== 0
    ) {
      faultFailures.push("hang-open-digest");
    }

    const recovery = await isolation.runIsolatedOperation(canonicalizeOperation());
    return {
      faultFailures,
      recoveryMatches: recovery.outputSha256 === expected.canonicalize,
      successFailures,
    };
  });

  expect(result.successFailures).toEqual([]);
  expect(result.faultFailures).toEqual([]);
  expect(result.recoveryMatches).toBe(true);
  expect(blockedRequests).toEqual([]);
  expect(consoleMessages).toEqual([]);
  expect(pageErrors).toEqual([]);
});
