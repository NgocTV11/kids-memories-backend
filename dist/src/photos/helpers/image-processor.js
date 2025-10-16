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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProcessor = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
class ImageProcessor {
    uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    constructor() {
        this.ensureUploadDirExists();
    }
    async ensureUploadDirExists() {
        const dirs = [
            this.uploadDir,
            path.join(this.uploadDir, 'original'),
            path.join(this.uploadDir, 'thumbnail'),
            path.join(this.uploadDir, 'medium'),
        ];
        for (const dir of dirs) {
            try {
                await fs.access(dir);
            }
            catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }
    async processImage(buffer, originalFilename) {
        const fileExt = path.extname(originalFilename);
        const uniqueId = (0, crypto_1.randomBytes)(16).toString('hex');
        const baseFilename = `${uniqueId}${fileExt}`;
        const originalPath = path.join(this.uploadDir, 'original', baseFilename);
        const thumbnailPath = path.join(this.uploadDir, 'thumbnail', baseFilename);
        const mediumPath = path.join(this.uploadDir, 'medium', baseFilename);
        await (0, sharp_1.default)(buffer)
            .rotate()
            .jpeg({ quality: 90, progressive: true })
            .toFile(originalPath);
        await (0, sharp_1.default)(buffer)
            .rotate()
            .resize(200, 200, {
            fit: 'cover',
            position: 'centre',
        })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        await (0, sharp_1.default)(buffer)
            .rotate()
            .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
        })
            .jpeg({ quality: 85 })
            .toFile(mediumPath);
        const baseUrl = '/uploads/photos';
        return {
            originalUrl: `${baseUrl}/original/${baseFilename}`,
            thumbnailUrl: `${baseUrl}/thumbnail/${baseFilename}`,
            mediumUrl: `${baseUrl}/medium/${baseFilename}`,
            originalPath,
            thumbnailPath,
            mediumPath,
        };
    }
    async extractExifData(buffer) {
        try {
            const metadata = await (0, sharp_1.default)(buffer).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                space: metadata.space,
                channels: metadata.channels,
                depth: metadata.depth,
                density: metadata.density,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation,
                exif: metadata.exif ? this.parseExifBuffer(metadata.exif) : {},
            };
        }
        catch (error) {
            console.error('Error extracting EXIF:', error);
            return {};
        }
    }
    parseExifBuffer(exifBuffer) {
        try {
            return {
                raw: exifBuffer.toString('base64').substring(0, 100),
            };
        }
        catch {
            return {};
        }
    }
    async deletePhotoFiles(originalUrl, thumbnailUrl, mediumUrl) {
        const files = [originalUrl, thumbnailUrl, mediumUrl];
        for (const fileUrl of files) {
            try {
                const filePath = path.join(process.cwd(), fileUrl);
                await fs.unlink(filePath);
            }
            catch (error) {
                console.error(`Error deleting file ${fileUrl}:`, error);
            }
        }
    }
}
exports.ImageProcessor = ImageProcessor;
//# sourceMappingURL=image-processor.js.map