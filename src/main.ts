import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  console.log('🔄 Starting Kids Memories API...');
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ NOT SET'}`);
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');
  console.log('✅ Global prefix set to: /api');

  // Static files for uploaded photos with caching
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    maxAge: '1y', // Cache images for 1 year
    etag: true,
    lastModified: true,
  });

  // CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  console.log(`✅ CORS enabled for: ${frontendUrl}`);

  // Security (allow images to be displayed)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log('='.repeat(50));
  console.log(`🚀 Kids Memories API is running!`);
  console.log(`📍 URL: http://0.0.0.0:${port}`);
  console.log(`🏥 Health Check: http://0.0.0.0:${port}/api/health`);
  console.log(`📚 API Endpoints: http://0.0.0.0:${port}/api`);
  console.log(`📁 Uploads: http://0.0.0.0:${port}/uploads/`);
  console.log('='.repeat(50));
}
bootstrap().catch((error) => {
  console.error('❌ Fatal error during bootstrap:', error);
  process.exit(1);
});
