/**
 * Config
 */
type CompareFunction<T> = (a: T, b: T) => number;
export interface IsSubsetConfig<T> {
  compareFunction: CompareFunction<T>;
}

/**
 * Check targets array is sub set of src array
 */
export function isSubset<T = any>(
  src: T[],
  targets: T[],
  config?: IsSubsetConfig<T>,
) {
  const n = targets.length,
    m = src.length;
  let i = 0,
    j = 0;

  if (m < n) return false;
  src.sort(config?.compareFunction);
  targets.sort(config?.compareFunction);
  while (i < n && j < m) {
    if (src[j] > targets[i]) return false;
    if (src[j] < targets[i]) j++;
    else {
      j++;
      i++;
    }
  }
  return !(i < n);
}
