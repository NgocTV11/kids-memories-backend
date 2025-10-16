import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Static files for uploaded photos with caching
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    maxAge: '1y', // Cache images for 1 year
    etag: true,
    lastModified: true,
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Security (allow images to be displayed)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Session support for OAuth
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

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

  console.log(`🚀 Backend running on: http://0.0.0.0:${port}`);
  console.log(`📚 API Docs: http://0.0.0.0:${port}/api`);
  console.log(`📁 Uploads: http://0.0.0.0:${port}/uploads/`);
}
bootstrap();
