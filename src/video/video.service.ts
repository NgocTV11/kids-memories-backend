import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Set ffmpeg path from installer
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private readonly tempDir = path.join(__dirname, '../../tmp/videos');

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    // Ensure temp directory exists
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      this.logger.log(`Temp directory ensured: ${this.tempDir}`);
    } catch (error) {
      this.logger.error(`Failed to create temp directory: ${error.message}`);
    }
  }

  /**
   * Process video: extract metadata, generate thumbnail, upload to S3
   * @param file - Uploaded video file from multer
   * @param userId - User ID who uploaded the video
   * @param kidId - Optional kid ID to associate video with
   * @param albumId - Optional album ID to associate video with
   * @returns Created video record
   */
  async processAndUploadVideo(
    file: Express.Multer.File,
    userId: string,
    kidId?: string,
    albumId?: string,
    title?: string,
    description?: string,
  ) {
    const videoId = uuidv4();
    const thumbnailPath = path.join(this.tempDir, `thumbnail-${videoId}.jpg`);

    try {
      this.logger.log(`Starting video processing for file: ${file.originalname}`);

      // 1. Validate file type
      if (!file.mimetype.startsWith('video/')) {
        throw new BadRequestException('File must be a video');
      }

      // 2. Extract video metadata
      const metadata = await this.getVideoMetadata(file.path);
      this.logger.log(`Video metadata extracted: ${JSON.stringify(metadata)}`);

      // 3. Generate thumbnail at 5-second mark (or at 10% of duration if video is shorter)
      const thumbnailTimestamp = Math.min(5, metadata.duration * 0.1);
      await this.generateThumbnail(
        file.path,
        thumbnailPath,
        this.formatTimestamp(thumbnailTimestamp),
      );
      this.logger.log(`Thumbnail generated at ${thumbnailTimestamp}s: ${thumbnailPath}`);

      // 4. Upload original video to S3
      const videoS3Key = `videos/original/${videoId}${path.extname(file.originalname)}`;
      const videoBuffer = await fs.readFile(file.path);
      const videoUrl = await this.s3Service.uploadFile(
        videoBuffer,
        videoS3Key,
        file.mimetype,
      );
      this.logger.log(`Video uploaded to S3: ${videoUrl}`);

      // 5. Upload thumbnail to S3
      const thumbnailS3Key = `videos/thumbnails/${videoId}.jpg`;
      const thumbnailBuffer = await fs.readFile(thumbnailPath);
      const thumbnailUrl = await this.s3Service.uploadFile(
        thumbnailBuffer,
        thumbnailS3Key,
        'image/jpeg',
      );
      this.logger.log(`Thumbnail uploaded to S3: ${thumbnailUrl}`);

      // 6. Save to database
      const video = await this.prisma.videos.create({
        data: {
          title: title || file.originalname,
          description,
          s3_key: videoS3Key,
          file_url: videoUrl,
          thumbnail_s3_key: thumbnailS3Key,
          thumbnail_url: thumbnailUrl,
          duration: metadata.duration,
          file_size: file.size,
          mime_type: file.mimetype,
          codec: metadata.codec,
          width: metadata.width,
          height: metadata.height,
          bitrate: metadata.bitrate,
          uploaded_by: userId,
          kid_id: kidId,
          album_id: albumId,
        },
      });

      this.logger.log(`Video record created in database: ${video.id}`);

      // 7. Update user storage usage
      await this.updateStorageUsage(userId, file.size);

      // 8. Cleanup temporary files
      await this.cleanupTempFiles([file.path, thumbnailPath]);

      return video;
    } catch (error) {
      this.logger.error(`Video processing failed: ${error.message}`, error.stack);
      // Cleanup on error
      await this.cleanupTempFiles([file.path, thumbnailPath]);
      throw error;
    }
  }

  /**
   * Generate thumbnail at specific timestamp using ffmpeg
   * @param videoPath - Path to video file
   * @param outputPath - Path to save thumbnail
   * @param timestamp - Timestamp in format "HH:MM:SS" or "MM:SS"
   */
  private generateThumbnail(
    videoPath: string,
    outputPath: string,
    timestamp: string = '00:00:05',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '640x360', // 16:9 aspect ratio thumbnail
        })
        .on('end', () => {
          this.logger.log('Thumbnail generated successfully');
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Thumbnail generation failed: ${err.message}`);
          reject(err);
        });
    });
  }

  /**
   * Extract video metadata using ffprobe
   * @param videoPath - Path to video file
   * @returns Video metadata object
   */
  private getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          return reject(err);
        }

        const videoStream = metadata.streams.find(
          (stream) => stream.codec_type === 'video',
        );

        if (!videoStream) {
          return reject(new Error('No video stream found'));
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          codec: videoStream.codec_name || 'unknown',
          bitrate: metadata.format.bit_rate
            ? Math.round(metadata.format.bit_rate / 1000)
            : 0,
        });
      });
    });
  }

  /**
   * Transcode video to web-optimized MP4 (H.264 + AAC)
   * Useful for ensuring compatibility across all browsers
   * @param inputPath - Path to input video
   * @param outputPath - Path to save transcoded video
   */
  private transcodeToWebFormat(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions([
          '-preset fast', // Balance between speed and compression
          '-crf 23', // Constant Rate Factor (quality: 0-51, lower = better)
          '-movflags +faststart', // Enable progressive playback (web streaming)
          '-profile:v baseline', // Compatible with most devices
          '-level 3.0',
          '-maxrate 2M', // Maximum bitrate 2Mbps
          '-bufsize 4M', // Buffer size
        ])
        .save(outputPath)
        .on('end', () => {
          this.logger.log('Transcoding completed');
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Transcoding failed: ${err.message}`);
          reject(err);
        })
        .on('progress', (progress) => {
          this.logger.log(
            `Transcoding progress: ${progress.percent?.toFixed(2)}%`,
          );
        });
    });
  }

  /**
   * Get all videos for a specific kid
   * @param kidId - Kid ID
   * @param userId - User ID (for authorization)
   * @returns Array of video records
   */
  async getVideosByKid(kidId: string, userId: string) {
    // Verify kid belongs to user
    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kidId,
        created_by: userId,
      },
    });

    if (!kid) {
      throw new NotFoundException('Kid not found or unauthorized');
    }

    return this.prisma.videos.findMany({
      where: {
        kid_id: kidId,
        is_deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        file_url: true,
        thumbnail_url: true,
        duration: true,
        width: true,
        height: true,
        file_size: true,
        view_count: true,
        likes_count: true,
        created_at: true,
      },
    });
  }

  /**
   * Get all videos for a specific album
   * @param albumId - Album ID
   * @param userId - User ID (for authorization)
   * @returns Array of video records
   */
  async getVideosByAlbum(albumId: string, userId: string) {
    // Verify album belongs to user
    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        created_by: userId,
      },
    });

    if (!album) {
      throw new NotFoundException('Album not found or unauthorized');
    }

    return this.prisma.videos.findMany({
      where: {
        album_id: albumId,
        is_deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get a single video by ID
   * @param videoId - Video ID
   * @param userId - User ID (for authorization)
   * @returns Video record
   */
  async getVideoById(videoId: string, userId: string) {
    const video = await this.prisma.videos.findFirst({
      where: {
        id: videoId,
        uploaded_by: userId,
        is_deleted: false,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found or unauthorized');
    }

    // Increment view count
    await this.prisma.videos.update({
      where: { id: videoId },
      data: { view_count: { increment: 1 } },
    });

    return video;
  }

  /**
   * Delete video (soft delete)
   * @param videoId - Video ID
   * @param userId - User ID (for authorization)
   */
  async deleteVideo(videoId: string, userId: string) {
    const video = await this.prisma.videos.findFirst({
      where: {
        id: videoId,
        uploaded_by: userId,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found or unauthorized');
    }

    // Soft delete
    await this.prisma.videos.update({
      where: { id: videoId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    // Update storage usage
    await this.updateStorageUsage(userId, -Number(video.file_size));

    this.logger.log(`Video soft-deleted: ${videoId}`);

    return { message: 'Video deleted successfully' };
  }

  /**
   * Permanently delete video from S3 and database
   * @param videoId - Video ID
   * @param userId - User ID (for authorization)
   */
  async permanentlyDeleteVideo(videoId: string, userId: string) {
    const video = await this.prisma.videos.findFirst({
      where: {
        id: videoId,
        uploaded_by: userId,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found or unauthorized');
    }

    try {
      // Delete from S3
      await this.s3Service.deleteFile(video.s3_key);
      await this.s3Service.deleteFile(video.thumbnail_s3_key);

      this.logger.log(`Deleted files from S3: ${video.s3_key}, ${video.thumbnail_s3_key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from S3: ${error.message}`);
    }

    // Delete from database
    await this.prisma.videos.delete({
      where: { id: videoId },
    });

    this.logger.log(`Video permanently deleted: ${videoId}`);

    return { message: 'Video permanently deleted' };
  }

  /**
   * Update user storage usage
   * @param userId - User ID
   * @param sizeChange - Size change in bytes (positive for add, negative for delete)
   */
  private async updateStorageUsage(userId: string, sizeChange: number) {
    try {
      const storageUsage = await this.prisma.storage_usage.findUnique({
        where: { user_id: userId },
      });

      if (storageUsage) {
        await this.prisma.storage_usage.update({
          where: { user_id: userId },
          data: {
            videos_size: { increment: sizeChange },
            total_size: { increment: sizeChange },
            video_count: { increment: sizeChange > 0 ? 1 : -1 },
          },
        });
      } else {
        await this.prisma.storage_usage.create({
          data: {
            user_id: userId,
            videos_size: sizeChange > 0 ? sizeChange : 0,
            total_size: sizeChange > 0 ? sizeChange : 0,
            video_count: sizeChange > 0 ? 1 : 0,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to update storage usage: ${error.message}`);
    }
  }

  /**
   * Cleanup temporary files
   * @param filePaths - Array of file paths to delete
   */
  private async cleanupTempFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
        this.logger.log(`Cleaned up: ${filePath}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup ${filePath}: ${error.message}`);
      }
    }
  }

  /**
   * Format seconds to timestamp string (HH:MM:SS)
   * @param seconds - Number of seconds
   * @returns Formatted timestamp string
   */
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
