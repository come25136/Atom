import { Logger } from '@nestjs/common'

export enum Mode {
  API = 'API',
  DATA_UPDATER = 'DATA_UPDATER',
}

function error(
  errorMsg: string,
  errorThrow = true,
  errorLogging = false,
): void {
  if (errorThrow) {
    throw new Error(errorMsg)
  } else {
    if (errorLogging) Logger.error(errorMsg)
  }
}

export function runMode(
  mode: Mode[number],
  errorThrow = true,
  errorLogging = false,
): boolean {
  if (process.env.MODE === mode) return true

  error(`${mode}モードでのみ使用可能な処理です`, errorThrow, errorLogging)

  return false
}

const decoratorGenerator = (mode: Mode[number]) => (
  errorThrow = true,
  errorLogging = false,
) => (target: any, propKey: string, descriptor: PropertyDescriptor) => {
  if ('value' in descriptor === false) return

  const original = descriptor.value

  descriptor.value = function(...args: unknown[]) {
    if (runMode(mode, errorThrow, errorLogging) === false) return

    return original.apply(this, args)
  }
}

export const ModeDecoratores = {
  APIServer: decoratorGenerator(Mode.API),
  DataUpdater: decoratorGenerator(Mode.DATA_UPDATER),
}
