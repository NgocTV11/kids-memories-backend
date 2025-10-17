import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';

export enum StorageFolder {
  AVATARS = 'avatars',
  PHOTOS = 'photos',
  ALBUMS = 'albums',
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private useLocalStorage: boolean;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
    this.region = this.configService.get<string>('AWS_REGION') || 'ap-southeast-1';
    
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    // Nếu không có AWS credentials, dùng local storage
    this.useLocalStorage = !accessKeyId || !secretAccessKey || !this.bucketName;

    if (this.useLocalStorage) {
      this.logger.warn('⚠️  AWS S3 credentials not found. Using LOCAL storage (not recommended for production)');
      this.logger.warn('⚠️  Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME in .env');
    } else {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`✅ AWS S3 initialized: ${this.bucketName} (${this.region})`);
    }
  }

  /**
   * Upload file to S3 or local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: StorageFolder,
  ): Promise<string> {
    if (this.useLocalStorage) {
      return this.uploadToLocal(file, folder);
    }

    return this.uploadToS3(file, folder);
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(
    file: Express.Multer.File,
    folder: StorageFolder,
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const key = `${folder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ❌ Removed ACL - Bucket uses Bucket Policy for public access instead
      });

      await this.s3Client.send(command);

      // Return public URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`✅ Uploaded to S3: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`❌ S3 upload failed: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload to local storage (fallback)
   */
  private uploadToLocal(
    file: Express.Multer.File,
    folder: StorageFolder,
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const relativePath = `/uploads/${folder}/${fileName}`;
    
    this.logger.warn(`⚠️  Using local storage: ${relativePath}`);
    
    // File already saved by multer to disk
    // Return relative URL
    return Promise.resolve(relativePath);
  }

  /**
   * Delete file from S3
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (this.useLocalStorage) {
      // For local storage, files remain (can implement cleanup if needed)
      this.logger.warn(`⚠️  Local file deletion not implemented: ${fileUrl}`);
      return;
    }

    try {
      // Extract key from URL
      const key = this.extractKeyFromUrl(fileUrl);
      
      if (!key) {
        this.logger.warn(`Cannot extract S3 key from URL: ${fileUrl}`);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`✅ Deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`❌ S3 delete failed: ${error.message}`);
      // Don't throw error, just log (file might already be deleted)
    }
  }

  /**
   * Extract S3 key from URL
   */
  private extractKeyFromUrl(url: string): string | null {
    if (!url) return null;

    // Handle S3 URL format: https://bucket.s3.region.amazonaws.com/folder/file.jpg
    const s3UrlPattern = new RegExp(`https://${this.bucketName}.s3.${this.region}.amazonaws.com/(.+)`);
    const match = url.match(s3UrlPattern);
    
    return match ? match[1] : null;
  }

  /**
   * Check if using S3 or local storage
   */
  isUsingS3(): boolean {
    return !this.useLocalStorage;
  }

  /**
   * Get storage type name
   */
  getStorageType(): string {
    return this.useLocalStorage ? 'LOCAL' : 'AWS S3';
  }
}
