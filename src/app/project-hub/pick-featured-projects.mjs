/**
 * Pick a random subset of Home projects for the Project Hub showcase.
 * 从 Home 项目池中随机抽取若干条，供 Project Hub 精选展示。
 *
 * @param {unknown[]} projects Full project catalog from Home.
 * @param {number} [count=7] How many items to return.
 * @param {() => number} [random=Math.random] RNG hook for tests.
 * @returns {unknown[]}
 */
export function pickFeaturedProjects(projects, count = 7, random = Math.random) {
  const pool = Array.isArray(projects) ? projects.slice() : [];
  const n = Math.min(Math.max(0, count), pool.length);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  return pool.slice(0, n);
}
