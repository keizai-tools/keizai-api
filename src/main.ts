import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/response_service/filter/all_exceptions.filter';
import { SuccessResponseInterceptor } from './common/response_service/interceptor/success_response.interceptor';
import { sentryConfig } from './configuration/sentry/sentry.configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('Keizai')
    .setDescription('Keizai API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api');
  app.enableCors();
  sentryConfig(app);

  await app.startAllMicroservices();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(configService.get('server.port'));
}
bootstrap();
