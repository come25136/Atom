import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RedocOptions, RedocModule } from 'nestjs-redoc'
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const options = new DocumentBuilder()
    .setTitle('Atom document')
    .setDescription('The Atom API description')
    .setVersion('3.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  const redocOptions: RedocOptions = {
    logo: {
      url: 'https://raw.githubusercontent.com/come25136/Atom/master/icon.png',
    },
    sortPropsAlphabetically: true,
    hideDownloadButton: true,
    hideHostname: false
  };
  // Instead of using SwaggerModule.setup() you call this module
  await RedocModule.setup('/', app, document, redocOptions);

  await app.listen(3000);
}
bootstrap();
