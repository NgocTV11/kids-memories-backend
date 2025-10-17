import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { TagKidsDto } from './dto/tag-kids.dto';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  /**
   * Upload a new photo
   * POST /photos/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException(
              'Only image files (JPEG, PNG, GIF, WebP) are allowed',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Query('album_id', ParseUUIDPipe) albumId: string,
    @Body() uploadDto: UploadPhotoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }

    return this.photosService.upload(file, userId, albumId, uploadDto, userRole);
  }

  /**
   * Get all photos with optional filters
   * GET /photos?album_id=xxx&kid_id=xxx&limit=50&offset=0
   */
  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Query('album_id') albumId?: string,
    @Query('kid_id') kidId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.photosService.findAll(
      userId,
      albumId,
      kidId,
      parsedLimit,
      parsedOffset,
      userRole,
    );
  }

  /**
   * Get a single photo by ID
   * GET /photos/:id
   */
  @Get(':id')
  async findOne(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.findOne(userId, photoId, userRole);
  }

  /**
   * Update photo metadata
   * PUT /photos/:id
   */
  @Put(':id')
  async update(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id', ParseUUIDPipe) photoId: string,
    @Body() updateDto: UpdatePhotoDto,
  ) {
    return this.photosService.update(userId, photoId, updateDto);
  }

  /**
   * Soft delete a photo
   * DELETE /photos/:id
   */
  @Delete(':id')
  async remove(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.remove(userId, photoId);
  }

  /**
   * Tag kids in a photo
   * POST /photos/:id/tag-kids
   */
  @Post(':id/tag-kids')
  async tagKids(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
    @Body() tagKidsDto: TagKidsDto,
  ) {
    return this.photosService.tagKids(userId, photoId, tagKidsDto);
  }

  /**
   * Like a photo
   * POST /photos/:id/like
   */
  @Post(':id/like')
  async like(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.like(userId, photoId);
  }

  /**
   * Unlike a photo
   * DELETE /photos/:id/like
   */
  @Delete(':id/like')
  async unlike(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.unlike(userId, photoId);
  }

  /**
   * Check if user liked a photo
   * GET /photos/:id/like/check
   */
  @Get(':id/like/check')
  async checkIfLiked(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.checkIfLiked(userId, photoId);
  }

  /**
   * Get all comments for a photo
   * GET /photos/:id/comments
   */
  @Get(':id/comments')
  async getComments(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.getComments(userId, photoId);
  }

  /**
   * Add a comment to a photo
   * POST /photos/:id/comments
   */
  @Post(':id/comments')
  async addComment(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
    @Body('content') content: string,
  ) {
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Comment content is required');
    }
    if (content.length > 1000) {
      throw new BadRequestException('Comment content must not exceed 1000 characters');
    }
    return this.photosService.addComment(userId, photoId, content);
  }

  /**
   * Track photo view
   * POST /photos/:id/views
   */
  @Post(':id/views')
  async trackView(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.trackView(photoId);
  }
}
