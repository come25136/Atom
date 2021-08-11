// const newrelic = require('newrelic')

import 'source-map-support/register'

import * as listEndpoints from 'express-list-endpoints'

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger, ValidationPipe } from '@nestjs/common'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { RedocModule, RedocOptions } from 'nestjs-redoc'
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked'
import { NestFactory } from '@nestjs/core'

import { Mode, runMode } from './util'
import { AppModule } from './app.module'

async function bootstrap() {
  initializeTransactionalContext() // Initialize cls-hooked
  patchTypeORMRepositoryWithBaseRepository() // patch Repository with BaseRepository.

  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  //   transport: Transport.REDIS,
  //   options: {
  //     url: 'redis://localhost:6379',
  //   },
  // })
  const app = await NestFactory.create(AppModule)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url:
        `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` ||
        'redis://redis:6379',
    },
  })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const options = new DocumentBuilder()
    .setTitle('Atom document')
    // .setDescription('The Atom API description')
    .setVersion('3.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)

  const redocOptions: RedocOptions = {
    // logo: {
    //   url: 'https://raw.githubusercontent.com/come25136/Atom/master/icon.png',
    // },
    sortPropsAlphabetically: true,
    hideDownloadButton: true,
    pathInMiddlePanel: true,
  }
  // Instead of using SwaggerModule.setup() you call this module
  await RedocModule.setup('/', app, document, redocOptions)

  await app.startAllMicroservicesAsync()
  if (runMode(Mode.API, false)) {
    app.enableCors({
      origin: '*',
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    })
    await app.listen(3000)
    Logger.log(
      `Application is running on: ${await app.getUrl()}`,
      'Atom',
      false,
    )
  } else {
    app.init()
  }

  // NOTE: 面白そうだったので実験的に入れてる
  // const server = app.getHttpServer();
  // const router = server._events.request._router;
  // console.log(listEndpoints(router))
  // Logger.debug(listEndpoints(router), 'Atom', false);
}

bootstrap()
