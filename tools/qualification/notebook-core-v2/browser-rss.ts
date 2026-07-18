export function sumPinnedBrowserProcessGroupRss(
  processTable: string,
  cachePath: string,
  processGroupId: number,
): number {
  if (!Number.isSafeInteger(processGroupId) || processGroupId < 2 || cachePath.length < 1) {
    throw new Error("invalid pinned browser process group");
  }
  let kib = 0;
  for (const line of processTable.split("\n")) {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (!match?.[1] || !match[2] || !match[3]) continue;
    if (Number(match[2]) !== processGroupId || !match[3].includes(cachePath)) continue;
    kib += Number(match[1]);
  }
  return kib * 1024;
}
