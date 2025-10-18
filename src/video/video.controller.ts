import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadVideoDto } from './dto/upload-video.dto';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './tmp/videos',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
      },
    }),
  )
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({
            fileType: /(video\/mp4|video\/quicktime|video\/x-msvideo|video\/webm)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadVideoDto: UploadVideoDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;

    return this.videoService.processAndUploadVideo(
      file,
      userId,
      uploadVideoDto.kidId,
      uploadVideoDto.albumId,
      uploadVideoDto.title,
      uploadVideoDto.description,
    );
  }

  @Get('kid/:kidId')
  async getVideosByKid(@Param('kidId') kidId: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.videoService.getVideosByKid(kidId, userId);
  }

  @Get('album/:albumId')
  async getVideosByAlbum(
    @Param('albumId') albumId: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.videoService.getVideosByAlbum(albumId, userId);
  }

  @Get(':id')
  async getVideoById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.videoService.getVideoById(id, userId);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.videoService.deleteVideo(id, userId);
  }

  @Delete(':id/permanent')
  async permanentlyDeleteVideo(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    return this.videoService.permanentlyDeleteVideo(id, userId);
  }
}
