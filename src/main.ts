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

  // CORS - Support multiple frontend domains + mobile app
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081', // Expo dev
    'https://kids-memories-frontend.vercel.app',
    'https://mihhan.vercel.app',
    'https://minhhan.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Expo Go, or curl)
      if (!origin) return callback(null, true);
      
      // Allow expo:// and exp:// schemes for mobile
      if (origin.startsWith('exp://') || origin.startsWith('expo://')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, be more permissive
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️  CORS allowing origin in dev mode: ${origin}`);
          callback(null, true);
        } else {
          console.warn(`⚠️  CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')} + mobile apps`);

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
