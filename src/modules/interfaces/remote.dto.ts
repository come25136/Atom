import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
  isDefined,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class OptionalURL {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @IsOptional() // Todo: optional要る？要検証
  @ApiProperty({ required: false })
  url?: string
}

// Note: redocにクラス名がそのまま出る
export class URL extends OptionalURL {
  @ApiProperty({ required: true })
  url: string
}

export class OptionalFetchedData extends OptionalURL {
  @IsDate()
  @IsOptional()
  lastFetchedDate: string | null // ISO8601
}

export class FetchedData extends OptionalFetchedData {
  @IsDate()
  lastFetchedDate: string
}

export class GTFSRTs {
  @ValidateNested()
  @Type(() => URL)
  @ApiProperty()
  trip_update: URL

  @ValidateNested()
  @Type(() => URL)
  @ApiProperty()
  vehicle_position: URL

  @ValidateNested()
  @Type(() => OptionalURL)
  @ApiProperty()
  alert: OptionalURL
}

export class FetchedGTFSRTs {
  @ValidateNested()
  @Type(() => OptionalFetchedData)
  @ApiProperty()
  trip_update: OptionalFetchedData

  @ValidateNested()
  @Type(() => OptionalFetchedData)
  @ApiProperty()
  vehicle_position: OptionalFetchedData

  @ValidateNested()
  @Type(() => OptionalFetchedData)
  @ApiProperty()
  alert: OptionalFetchedData
}

export class Display {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string
}

export class License extends OptionalURL {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: string
}

export class RegistrationRemoteDto {
  @ValidateNested()
  @Type(() => Display)
  @IsDefined()
  @ApiProperty()
  display: Display

  @ValidateNested()
  @Type(() => URL)
  @IsDefined()
  @ApiProperty()
  portal: URL

  @ValidateNested()
  @Type(() => License)
  @IsDefined()
  @ApiProperty()
  license: License

  @ValidateNested()
  @Type(() => URL)
  @IsDefined()
  @ApiProperty()
  static: URL

  @ValidateNested()
  @Type(() => GTFSRTs)
  @IsDefined()
  @ApiProperty()
  realtime: GTFSRTs
}

export enum StatusResult {
  ERROR = 'error',
  INITING = 'initing',
  PENDING = 'pending',
  IMPORTING = 'importing',
  IMPORTED = 'imported',
}

export class Crawl {
  status: StatusResult
}

export class RegisterRemoteDto {
  @ValidateNested()
  @Type(() => Crawl)
  @IsDefined()
  @ApiProperty()
  crawl: Crawl
}

export class FindRemoteDto {
  @ValidateNested()
  @Type(() => Crawl)
  @IsDefined()
  @ApiProperty()
  crawl: Crawl

  @ValidateNested()
  @Type(() => Display)
  @IsDefined()
  @ApiProperty()
  display: Display

  @ValidateNested()
  @Type(() => URL)
  @IsDefined()
  @ApiProperty()
  portal: URL

  @ValidateNested()
  @Type(() => License)
  @IsDefined()
  @ApiProperty()
  license: License

  @ValidateNested()
  @Type(() => URL)
  @IsDefined()
  @ApiProperty()
  static: FetchedData

  @ValidateNested()
  @Type(() => GTFSRTs)
  @IsDefined()
  @ApiProperty()
  realtime: FetchedGTFSRTs
}
