export function createMarkerBaselineResolver(runGit) {
  const cache = new Map();

  return async (relativePath, block) => {
    const cacheKey = `${relativePath}\n${block.start}\n${block.end}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const { stdout: revisions } = await runGit(['log', '--format=%H', '--all', '--', relativePath]);
    const candidates = ['HEAD', ...revisions.trim().split(/\r?\n/).filter(Boolean)];
    for (const revision of [...new Set(candidates)]) {
      try {
        const { stdout: source } = await runGit(['show', `${revision}:${relativePath}`]);
        const startIndex = source.indexOf(block.start);
        const endIndex = source.indexOf(block.end);
        if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
          cache.set(cacheKey, source);
          return source;
        }
      } catch {
        continue;
      }
    }

    throw new Error(`Git 历史中缺少恢复标记：${relativePath}（${block.start}）`);
  };
}
