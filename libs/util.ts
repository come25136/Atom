export function mapToObj<T>(map: Map<string, T>) {
  return [...map].reduce((prev, [k, v]) => ({ ...prev, [k]: v }), {})
}
