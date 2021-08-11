import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common'
import { isEmpty } from 'class-validator'

export class PipeIsNotEmpty<T = any> implements PipeTransform<T, T> {
  transform(value: T, metadata: ArgumentMetadata) {
    if (isEmpty(value))
      throw new BadRequestException(`${metadata.data} is empty.`)

    return value
  }
}
