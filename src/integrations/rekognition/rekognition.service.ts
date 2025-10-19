import { Injectable, Logger } from '@nestjs/common';
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectFacesCommand,
  SearchFacesByImageCommand,
  Label,
  FaceDetail,
  FaceMatch,
} from '@aws-sdk/client-rekognition';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class RekognitionService {
  private readonly logger = new Logger(RekognitionService.name);
  private rekClient: RekognitionClient;
  private s3Client: S3Client;

  constructor() {
    const region = process.env.AWS_REGION || 'ap-southeast-1';
    this.rekClient = new RekognitionClient({ region });
    this.s3Client = new S3Client({ region });
    this.logger.log(`RekognitionService initialized with region: ${region}`);
  }

  /**
   * Fetch object bytes from S3 and return Buffer
   */
  private async getS3ObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    try {
      const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
      const res = await this.s3Client.send(getCmd);

      if (!res.Body) {
        throw new Error('S3 object body is empty');
      }

      // Convert stream to buffer
      const bodyStream = res.Body as Readable;
      const chunks: Buffer[] = [];

      return new Promise<Buffer>((resolve, reject) => {
        bodyStream.on('data', (chunk: Buffer) => chunks.push(chunk));
        bodyStream.on('end', () => resolve(Buffer.concat(chunks)));
        bodyStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to fetch S3 object: ${bucket}/${key}`, error);
      throw error;
    }
  }

  /**
   * Detect labels from an image stored in S3
   * @param bucket S3 bucket name
   * @param key S3 object key
   * @returns Array of detected labels with confidence scores
   */
  async detectLabelsFromS3(
    bucket: string,
    key: string,
  ): Promise<Label[]> {
    try {
      this.logger.log(`Detecting labels for s3://${bucket}/${key}`);
      const imageBytes = await this.getS3ObjectBuffer(bucket, key);

      const command = new DetectLabelsCommand({
        Image: { Bytes: imageBytes },
        MaxLabels: 20,
        MinConfidence: 70,
      });

      const res = await this.rekClient.send(command);
      const labels = res.Labels || [];

      this.logger.log(
        `Detected ${labels.length} labels for s3://${bucket}/${key}`,
      );
      return labels;
    } catch (error) {
      this.logger.error(
        `Failed to detect labels for s3://${bucket}/${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Detect faces from an image stored in S3
   * @param bucket S3 bucket name
   * @param key S3 object key
   * @returns Array of detected faces with attributes
   */
  async detectFacesFromS3(
    bucket: string,
    key: string,
  ): Promise<FaceDetail[]> {
    try {
      this.logger.log(`Detecting faces for s3://${bucket}/${key}`);
      const imageBytes = await this.getS3ObjectBuffer(bucket, key);

      const command = new DetectFacesCommand({
        Image: { Bytes: imageBytes },
        Attributes: ['ALL'], // Include age range, emotions, gender, etc.
      });

      const res = await this.rekClient.send(command);
      const faces = res.FaceDetails || [];

      this.logger.log(
        `Detected ${faces.length} faces for s3://${bucket}/${key}`,
      );
      return faces;
    } catch (error) {
      this.logger.error(
        `Failed to detect faces for s3://${bucket}/${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Search for matching faces in a collection
   * @param bucket S3 bucket name
   * @param key S3 object key
   * @param collectionId Rekognition collection ID
   * @param threshold Face match threshold (0-100)
   * @returns Array of matching faces
   */
  async searchFacesByImage(
    bucket: string,
    key: string,
    collectionId: string,
    threshold = 80,
  ): Promise<FaceMatch[]> {
    try {
      this.logger.log(
        `Searching faces for s3://${bucket}/${key} in collection ${collectionId}`,
      );
      const imageBytes = await this.getS3ObjectBuffer(bucket, key);

      const command = new SearchFacesByImageCommand({
        CollectionId: collectionId,
        Image: { Bytes: imageBytes },
        FaceMatchThreshold: threshold,
        MaxFaces: 5,
      });

      const res = await this.rekClient.send(command);
      const matches = res.FaceMatches || [];

      this.logger.log(
        `Found ${matches.length} matching faces for s3://${bucket}/${key}`,
      );
      return matches;
    } catch (error) {
      this.logger.error(
        `Failed to search faces for s3://${bucket}/${key}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Process image and return both labels and faces
   * Convenience method for common use case
   */
  async analyzeImage(bucket: string, key: string) {
    const [labels, faces] = await Promise.all([
      this.detectLabelsFromS3(bucket, key),
      this.detectFacesFromS3(bucket, key),
    ]);

    return {
      labels: labels.map((l) => ({
        name: l.Name,
        confidence: l.Confidence,
      })),
      faces: faces.map((f) => ({
        boundingBox: f.BoundingBox,
        ageRange: f.AgeRange,
        gender: f.Gender?.Value,
        emotions: f.Emotions?.map((e) => ({
          type: e.Type,
          confidence: e.Confidence,
        })),
        smile: f.Smile?.Value,
      })),
    };
  }
}
