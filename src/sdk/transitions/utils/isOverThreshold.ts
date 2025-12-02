export function isOverThreshold(delta: number, threshold: number) {
  return Math.abs(delta) > threshold;
}
