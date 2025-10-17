"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = exports.StorageFolder = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const path = __importStar(require("path"));
var StorageFolder;
(function (StorageFolder) {
    StorageFolder["AVATARS"] = "avatars";
    StorageFolder["PHOTOS"] = "photos";
    StorageFolder["ALBUMS"] = "albums";
})(StorageFolder || (exports.StorageFolder = StorageFolder = {}));
let StorageService = StorageService_1 = class StorageService {
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    s3Client;
    bucketName;
    region;
    useLocalStorage;
    constructor(configService) {
        this.configService = configService;
        this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || '';
        this.region = this.configService.get('AWS_REGION') || 'ap-southeast-1';
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID') || '';
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY') || '';
        this.useLocalStorage = !accessKeyId || !secretAccessKey || !this.bucketName;
        if (this.useLocalStorage) {
            this.logger.warn('⚠️  AWS S3 credentials not found. Using LOCAL storage (not recommended for production)');
            this.logger.warn('⚠️  Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME in .env');
        }
        else {
            this.s3Client = new client_s3_1.S3Client({
                region: this.region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log(`✅ AWS S3 initialized: ${this.bucketName} (${this.region})`);
        }
    }
    async uploadFile(file, folder) {
        if (this.useLocalStorage) {
            return this.uploadToLocal(file, folder);
        }
        return this.uploadToS3(file, folder);
    }
    async uploadToS3(file, folder) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
        const key = `${folder}/${fileName}`;
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read',
            });
            await this.s3Client.send(command);
            const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
            this.logger.log(`✅ Uploaded to S3: ${url}`);
            return url;
        }
        catch (error) {
            this.logger.error(`❌ S3 upload failed: ${error.message}`);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    uploadToLocal(file, folder) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${(0, crypto_1.randomUUID)()}${fileExtension}`;
        const relativePath = `/uploads/${folder}/${fileName}`;
        this.logger.warn(`⚠️  Using local storage: ${relativePath}`);
        return Promise.resolve(relativePath);
    }
    async deleteFile(fileUrl) {
        if (this.useLocalStorage) {
            this.logger.warn(`⚠️  Local file deletion not implemented: ${fileUrl}`);
            return;
        }
        try {
            const key = this.extractKeyFromUrl(fileUrl);
            if (!key) {
                this.logger.warn(`Cannot extract S3 key from URL: ${fileUrl}`);
                return;
            }
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`✅ Deleted from S3: ${key}`);
        }
        catch (error) {
            this.logger.error(`❌ S3 delete failed: ${error.message}`);
        }
    }
    extractKeyFromUrl(url) {
        if (!url)
            return null;
        const s3UrlPattern = new RegExp(`https://${this.bucketName}.s3.${this.region}.amazonaws.com/(.+)`);
        const match = url.match(s3UrlPattern);
        return match ? match[1] : null;
    }
    isUsingS3() {
        return !this.useLocalStorage;
    }
    getStorageType() {
        return this.useLocalStorage ? 'LOCAL' : 'AWS S3';
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map