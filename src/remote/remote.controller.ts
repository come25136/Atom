import { Body, Controller, Put } from '@nestjs/common';
import { RemoteService } from 'src/remote/remote.service';
import { RegistrationRemoteDto } from '../interfaces/remote.dto';

@Controller('remotes')
export class RemoteController {
  constructor(private readonly service: RemoteService) { }

  @Put(':id')
  registration(@Body() registrationRemoteDto: RegistrationRemoteDto): any {
    return this.service.registration(registrationRemoteDto.id, 'tekitouhash')
  }
}
