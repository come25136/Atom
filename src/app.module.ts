import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteModule } from './remote/remote.module';
import { AgencyService } from './agency/agency.service';
import { AgencyModule } from './agency/agency.module';
import { TranslationModule } from './translation/translation.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'raspberrypi.local',
      port: 3306,
      username: 'come25136',
      password: 'remote',
      database: 'atom_dev_nest',
      autoLoadEntities: true,
      synchronize: false,
    }),
    RemoteModule,
    AgencyModule,
    TranslationModule,
  ],
  controllers: [],
  providers: [AppService, AgencyService],
})
export class AppModule { }
