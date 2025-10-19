import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RekognitionService } from '../integrations/rekognition/rekognition.service';
import { PrismaService } from '../prisma/prisma.service';

export interface PhotoTaggingJob {
  photoId: string;
  s3Bucket: string;
  s3Key: string;
}

@Processor('photo-tagging')
export class PhotoTaggingWorker extends WorkerHost {
  private readonly logger = new Logger(PhotoTaggingWorker.name);

  constructor(
    private readonly rekognitionService: RekognitionService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<PhotoTaggingJob>): Promise<void> {
    const { photoId, s3Bucket, s3Key } = job.data;

    this.logger.log(
      `Processing photo tagging job for photoId=${photoId}, s3Key=${s3Key}`,
    );

    try {
      // Analyze image with Rekognition
      const analysis = await this.rekognitionService.analyzeImage(
        s3Bucket,
        s3Key,
      );

      // Update photo record with metadata
      await this.prisma.photos.update({
        where: { id: photoId },
        data: {
          metadata: {
            labels: analysis.labels,
            faces: analysis.faces,
            analyzedAt: new Date().toISOString(),
          },
        },
      });

      this.logger.log(
        `Successfully tagged photo ${photoId} with ${analysis.labels.length} labels and ${analysis.faces.length} faces`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process photo tagging for ${photoId}`,
        error,
      );
      throw error; // Will trigger retry if configured
    }
  }
}
