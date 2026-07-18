import { describe, expect, test } from "bun:test";

import { sumPinnedBrowserProcessGroupRss } from "./browser-rss";

const CACHE = "/qualification-cache/firefox-1532";

describe("Notebook browser RSS process selection", () => {
  test("sums only the pinned cache processes in the selected process group", () => {
    const table = [
      `1000 420 ${CACHE}/firefox --headless`,
      `250 420 ${CACHE}/plugin-container --childID 1`,
      `9000 421 ${CACHE}/firefox --headless`,
      "7000 420 /another-cache/firefox --headless",
      "malformed row",
    ].join("\n");

    expect(sumPinnedBrowserProcessGroupRss(table, CACHE, 420)).toBe(1250 * 1024);
  });

  test("fails closed for an invalid process group or cache path", () => {
    expect(() => sumPinnedBrowserProcessGroupRss("", CACHE, 0)).toThrow(
      "invalid pinned browser process group",
    );
    expect(() => sumPinnedBrowserProcessGroupRss("", "", 420)).toThrow(
      "invalid pinned browser process group",
    );
  });
});
