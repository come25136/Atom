import * as _ from 'lodash'

export class CalcAverageSetTimeout<
  Fc extends (timeHistoryAvg: number) => void
> {
  private loopTimer: ReturnType<typeof setTimeout> | null = null
  private msTimeHistory: number[] = []

  constructor(private loopFc: Fc, private timeHistoryLength: number) {}

  private addTime(time: number) {
    this.msTimeHistory.push(time)
    if (this.timeHistoryLength < this.msTimeHistory.length)
      this.msTimeHistory.shift()
  }

  start() {
    this.loopFc(null)
  }

  nextTimeout(msTime: number, addTimeHistory = true) {
    if (addTimeHistory) this.addTime(msTime)

    const timeHistoryAvg =
      0 < this.msTimeHistory.length ? _.mean(this.msTimeHistory) : null

    this.loopTimer = setTimeout(() => this.loopFc(timeHistoryAvg), msTime)
  }

  stop() {
    clearTimeout(this.loopTimer)
    this.loopTimer = null
  }
}
