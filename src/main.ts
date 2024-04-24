import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({}));
    app.setGlobalPrefix('api/v1/');
    app.enableCors();
    await app.listen(process.env.PORT);
    console.log(process.env.CLIENT_HOST)
}
bootstrap();
