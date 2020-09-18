import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
