import { CalcAverageSetTimeout } from 'src/lib/interval_average_timer'
import { InternalServerErrorException } from '@nestjs/common'
import { Remote } from 'src/database/tables/remote/remote.entity'

interface Events {
  update: (request: Request, response: Response) => void
}

export abstract class PeriodicProcessorService {
  // NOTE: bindはany祭りなので冗長だけどクロージャで囲む
  private timer = new CalcAverageSetTimeout(async (...args) => {
    const result = await this.loop(...args)
    const ms = result instanceof Array ? result[0] : result
    const addTimeHistory = result instanceof Array ? result[1] : undefined
    this.timer.nextTimeout(ms, addTimeHistory)
  }, 20)

  constructor(protected readonly remoteUid: Remote['uid']) {}

  protected abstract loop(
    timeAvg: number,
  ): number | Promise<number> | [number, boolean] | Promise<[number, boolean]>

  start() {
    if (this.remoteUid === null)
      throw new InternalServerErrorException('Not initialized')

    this.timer.start()
  }

  stop() {
    this.timer.stop()
  }
}
