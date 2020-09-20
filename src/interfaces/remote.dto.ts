import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrationRemoteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  license: string;
}
