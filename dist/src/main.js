"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    console.log('🔄 Starting Kids Memories API...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ NOT SET'}`);
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    console.log('✅ Global prefix set to: /api');
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
        maxAge: '1y',
        etag: true,
        lastModified: true,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });
    console.log(`✅ CORS enabled for: ${frontendUrl}`);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
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
//# sourceMappingURL=main.js.map