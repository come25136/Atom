import { Module } from '@nestjs/common';
import { GtfsArchiveService } from './gtfs-archive.service';

@Module({
  providers: [GtfsArchiveService],
})
export class GtfsArchiveModule { }
