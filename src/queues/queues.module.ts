import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PhotoTaggingWorker } from './photo-tagging.worker';
import { RekognitionModule } from '../integrations/rekognition/rekognition.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'photo-tagging',
    }),
    RekognitionModule,
    PrismaModule,
  ],
  providers: [PhotoTaggingWorker],
  exports: [BullModule],
})
export class QueuesModule {}
