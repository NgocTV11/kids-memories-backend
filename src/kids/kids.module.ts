import { Module } from '@nestjs/common';
import { KidsController } from './kids.controller';
import { KidsService } from './kids.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KidsController],
  providers: [KidsService],
  exports: [KidsService],
})
export class KidsModule {}
