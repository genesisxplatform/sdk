// normalize opacity to ensure that the value is within CSS acceptable range
// and tune the range slightly to make sure transitionEnd gets fired
export function normalizeOpacity(value: number) {
  return Math.max(0.01, Math.min(0.99, value));
}
