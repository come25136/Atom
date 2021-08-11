import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  WsExceptionFilter,
} from '@nestjs/common'
import { isObject } from '@nestjs/common/utils/shared.utils'
import { MESSAGES } from '@nestjs/core/constants'
import { WsException } from '@nestjs/websockets'

function isExceptionObject(err: any): err is Error {
  return isObject(err) && typeof (err as Error).message === 'string'
}

@Catch()
export class WsErrorFilter<TError = any> implements WsExceptionFilter<TError> {
  private static readonly logger = new Logger('WsExceptionsHandler')

  catch(exception: TError, host: ArgumentsHost) {
    const callback = host.getArgByIndex(2) // NOTE: [socket, data, callback]
    this.handleError(callback, exception)
  }

  handleError<TCallback extends (err?: any) => void>(
    cb: TCallback,
    exception: TError,
  ) {
    if (
      !(exception instanceof WsException || exception instanceof HttpException)
    ) {
      return this.handleUnknownError(cb, exception)
    }

    const status =
      exception instanceof HttpException ? exception.getStatus() : 'error'
    const result =
      exception instanceof WsException
        ? exception.getError()
        : exception.message
    const message = isObject(result)
      ? result
      : {
          error: {
            code: status,
            message: result,
          },
        }

    if (cb) cb(message)
  }

  handleUnknownError<TCallback extends (err?: any) => void>(
    cb: TCallback,
    exception: TError,
  ) {
    const status = InternalServerErrorException

    cb({
      error: {
        code: status,
        message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
      },
    })

    if (isExceptionObject(exception)) {
      return WsErrorFilter.logger.error(exception.message, exception.stack)
    }

    return WsErrorFilter.logger.error(exception)
  }
}
