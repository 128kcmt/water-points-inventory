import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('DEBUG: POSTGRES_DB is:', process.env.POSTGRES_DB);

  const config = new DocumentBuilder()
    .setTitle('Malawi Water Point Inventory API')
    .setDescription('API for Water Point Inventory Dashboard')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors(); // Enable CORS for frontend
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
