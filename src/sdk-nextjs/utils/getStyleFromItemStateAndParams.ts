export function getStyleFromItemStateAndParams<T>(
  stateValue: T | undefined,
  paramsValue: T
): T {
  return (stateValue as T) !== undefined
    ? stateValue as T
    : paramsValue;
}
