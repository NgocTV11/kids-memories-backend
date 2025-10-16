import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';

export interface ImageProcessingResult {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  originalPath: string;
  thumbnailPath: string;
  mediumPath: string;
}

export class ImageProcessor {
  private uploadDir = path.join(process.cwd(), 'uploads', 'photos');

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'original'),
      path.join(this.uploadDir, 'thumbnail'),
      path.join(this.uploadDir, 'medium'),
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Process uploaded image - create thumbnail and medium versions
   */
  async processImage(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<ImageProcessingResult> {
    // Generate unique filename
    const fileExt = path.extname(originalFilename);
    const uniqueId = randomBytes(16).toString('hex');
    const baseFilename = `${uniqueId}${fileExt}`;

    // Define paths
    const originalPath = path.join(this.uploadDir, 'original', baseFilename);
    const thumbnailPath = path.join(this.uploadDir, 'thumbnail', baseFilename);
    const mediumPath = path.join(this.uploadDir, 'medium', baseFilename);

    // Process original (optimize but keep quality)
    await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .jpeg({ quality: 90, progressive: true })
      .toFile(originalPath);

    // Create thumbnail (200x200, cover)
    await sharp(buffer)
      .rotate()
      .resize(200, 200, {
        fit: 'cover',
        position: 'centre',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Create medium (800x800, inside)
    await sharp(buffer)
      .rotate()
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);

    // Generate URLs (relative paths)
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

  /**
   * Extract EXIF data from image
   */
  async extractExifData(buffer: Buffer): Promise<Record<string, any>> {
    try {
      const metadata = await sharp(buffer).metadata();

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
    } catch (error) {
      console.error('Error extracting EXIF:', error);
      return {};
    }
  }

  /**
   * Parse EXIF buffer to readable object
   */
  private parseExifBuffer(exifBuffer: Buffer): Record<string, any> {
    try {
      // Simple EXIF parsing - can be enhanced with exifreader library
      return {
        raw: exifBuffer.toString('base64').substring(0, 100), // First 100 chars
      };
    } catch {
      return {};
    }
  }

  /**
   * Delete photo files (all versions)
   */
  async deletePhotoFiles(
    originalUrl: string,
    thumbnailUrl: string,
    mediumUrl: string,
  ) {
    const files = [originalUrl, thumbnailUrl, mediumUrl];

    for (const fileUrl of files) {
      try {
        const filePath = path.join(process.cwd(), fileUrl);
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error);
      }
    }
  }
}
