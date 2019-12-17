export type TimeRange = (
  | {
      start: number
    }
  | {
      end: number
    }
) & {
  start: number
  end: number
}
