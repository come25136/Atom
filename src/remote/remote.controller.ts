import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { Remote } from 'src/database/entities/remote.entity';
import { RemoteService } from 'src/remote/remote.service';
import { RegistrationRemoteDto } from '../interfaces/remote.dto';

@Controller('remotes')
export class RemoteController {
  constructor(private readonly service: RemoteService) { }

  @Put(':id')
  @ApiCreatedResponse({ type: Remote })
  registration(@Param() params: any, @Body() body: RegistrationRemoteDto): Promise<Remote> {
    return this.service.registration({ ...params, ...body })
  }
}
