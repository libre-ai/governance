import type { NotebookCoreApi, SealBackupRequest } from "./host";
import { closedRefusal } from "./host";

type BenchmarkRequest =
  | {
      operation: "seal";
      recoverySecret: Uint8Array;
      request: SealBackupRequest;
      requestId: number;
    }
  | {
      envelope: Uint8Array;
      operation: "open" | "open-failure";
      recoverySecret: Uint8Array;
      requestId: number;
    };

type ComponentModule = {
  instantiate(
    loader: (path: string) => Promise<WebAssembly.Module>,
    imports: Record<string, never>,
    instantiateCore: (module: WebAssembly.Module) => Promise<WebAssembly.Instance>,
  ): Promise<{ api: NotebookCoreApi }>;
};

type WorkerScope = {
  onmessage: ((event: { data: unknown }) => void) | null;
  postMessage(message: unknown, transfer?: ArrayBuffer[]): void;
};

const scope = globalThis as unknown as WorkerScope;
let handled = false;

scope.onmessage = async (event) => {
  if (handled) throw new Error("benchmark worker accepts exactly one operation");
  handled = true;
  const request = decodeRequest(event.data);
  const memories: WebAssembly.Memory[] = [];
  try {
    const componentUrl = "./notebook-core.js";
    const component = (await import(componentUrl)) as ComponentModule;
    const root = await component.instantiate(
      async (path) => {
        const response = await fetch(new URL(path, import.meta.url), { cache: "no-store" });
        if (!response.ok) throw new Error("benchmark core module unavailable");
        const module = await WebAssembly.compile(await response.arrayBuffer());
        if (WebAssembly.Module.imports(module).length !== 0) {
          throw new Error("benchmark core module has imports");
        }
        return module;
      },
      {},
      async (module) => {
        const instance = await WebAssembly.instantiate(module, {});
        const exportedMemory = instance.exports.memory;
        if (!(exportedMemory instanceof WebAssembly.Memory)) {
          throw new Error("benchmark memory export unavailable");
        }
        if (!memories.includes(exportedMemory)) memories.push(exportedMemory);
        return instance;
      },
    );
    await execute(root.api, request, () =>
      memories.reduce((total, memory) => total + memory.buffer.byteLength, 0),
    );
  } catch (error) {
    scope.postMessage({
      code: closedRefusal(error).code,
      requestId: request.requestId,
      tag: "err",
    });
  } finally {
    wipeRequest(request);
  }
};

async function execute(
  api: NotebookCoreApi,
  request: BenchmarkRequest,
  memoryBytes: () => number,
): Promise<void> {
  if (request.operation === "seal") {
    let envelope: Uint8Array | undefined;
    const started = performance.now();
    try {
      envelope = api.sealBackup(request.request, request.recoverySecret);
      const operationMs = performance.now() - started;
      scope.postMessage(
        {
          envelope,
          operationMs,
          requestId: request.requestId,
          tag: "seal-ok",
          wasmMemoryBytes: memoryBytes(),
        },
        [envelope.buffer as ArrayBuffer],
      );
    } finally {
      try {
        envelope?.fill(0);
      } catch {
        // A successful response transfers ownership and detaches the envelope.
      }
    }
    return;
  }

  let openedPlaintext: Uint8Array | undefined;
  const started = performance.now();
  try {
    const opened = api.openBackup(request.envelope, request.recoverySecret);
    const operationMs = performance.now() - started;
    openedPlaintext = opened.plaintext;
    if (request.operation === "open-failure") {
      throw new Error("failure benchmark unexpectedly released plaintext");
    }
    const outputSha256 = await sha256(openedPlaintext);
    scope.postMessage({
      operationMs,
      outputLength: openedPlaintext.length,
      outputSha256,
      requestId: request.requestId,
      tag: "open-ok",
      wasmMemoryBytes: memoryBytes(),
    });
  } catch (error) {
    if (request.operation !== "open-failure") throw error;
    const refusal = closedRefusal(error);
    scope.postMessage({
      code: refusal.code,
      operationMs: performance.now() - started,
      requestId: request.requestId,
      tag: "open-refused",
      wasmMemoryBytes: memoryBytes(),
    });
  } finally {
    openedPlaintext?.fill(0);
  }
}

function decodeRequest(value: unknown): BenchmarkRequest {
  if (typeof value !== "object" || value === null) throw new Error("invalid benchmark request");
  const request = value as Partial<BenchmarkRequest>;
  if (
    !Number.isSafeInteger(request.requestId) ||
    !["seal", "open", "open-failure"].includes(request.operation ?? "")
  ) {
    throw new Error("invalid benchmark request");
  }
  return request as BenchmarkRequest;
}

function wipeRequest(request: BenchmarkRequest): void {
  const views =
    request.operation === "seal"
      ? [
          request.request.kdf.salt,
          request.request.nonce,
          request.request.plaintext,
          request.recoverySecret,
        ]
      : [request.envelope, request.recoverySecret];
  for (const view of views) view.fill(0);
}

async function sha256(value: Uint8Array): Promise<string> {
  const copy = new Uint8Array(value.length);
  copy.set(value);
  try {
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", copy.buffer));
    return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  } finally {
    copy.fill(0);
  }
}
