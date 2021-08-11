import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { Geometry } from 'src/interfaces/geometry'
import { PipeCoordinate } from 'src/pipes/geometry.pipe'
import { PipeIsNotEmpty } from 'src/pipes/util'
import { PipeRemoteByIds } from 'src/pipes/remote.pipe'
import { Remote } from 'src/database/tables/remote/remote.entity'
import { StopService } from 'src/modules/stop/stop.service'

@Controller()
export class StopsController {
  constructor(private readonly service: StopService) {}

  // @Get(':coordinate')
  // @ApiParam({ name: 'remoteId', type: String })
  // async findOne(
  //   @Query('remote_ids', PipeIsNotEmpty, PipeIsNotEmpty, PipeRemoteByIds)
  //   remotes: Remote[],
  //   @Param('coordinate', PipeIsNotEmpty, PipeCoordinate)
  //   coordinate: Geometry.Coordinate,
  // ): Promise<any> {
  //   const stops = await this.service.findByLocation(
  //     remotes.map(remote => remote.uid),
  //     coordinate,
  //   )
  //   const result = stops.map(this.service.toJSON)

  //   return result
  // }
}
