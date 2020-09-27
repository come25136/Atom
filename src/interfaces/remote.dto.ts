import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

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

export class GTFSRTs {
  @ValidateNested()
  @ApiProperty()
  trip_update: URL

  @ValidateNested()
  @ApiProperty()
  vehicle_position: URL

  @ValidateNested()
  @ApiProperty()
  alert: OptionalURL
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
  @ApiProperty()
  display: Display

  @ValidateNested()
  @ApiProperty()
  portal: URL

  @ValidateNested()
  @ApiProperty()
  license: License;

  @ValidateNested()
  @ApiProperty()
  static: URL

  @ValidateNested()
  @ApiProperty()
  realtime: GTFSRTs
}
