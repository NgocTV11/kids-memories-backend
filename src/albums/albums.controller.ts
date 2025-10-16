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
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { ShareAlbumDto } from './dto/share-album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  /**
   * Create a new album
   * POST /api/v1/albums
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() createAlbumDto: CreateAlbumDto,
  ) {
    return this.albumsService.create(userId, createAlbumDto, userRole);
  }

  /**
   * Get all albums (optionally filter by kid_id)
   * GET /api/v1/albums?kid_id=xxx
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Query('kid_id') kidId?: string,
  ) {
    return this.albumsService.findAll(userId, kidId, userRole);
  }

  /**
   * Get one album by ID
   * GET /api/v1/albums/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') albumId: string,
  ) {
    return this.albumsService.findOne(userId, albumId, userRole);
  }

  /**
   * Update album
   * PUT /api/v1/albums/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') albumId: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(userId, albumId, updateAlbumDto, userRole);
  }

  /**
   * Delete album
   * DELETE /api/v1/albums/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') albumId: string,
  ) {
    return this.albumsService.remove(userId, albumId, userRole);
  }

  /**
   * Share album - Generate share link
   * POST /api/v1/albums/:id/share
   */
  @Post(':id/share')
  @UseGuards(JwtAuthGuard)
  async shareAlbum(
    @GetUser('id') userId: string,
    @Param('id') albumId: string,
    @Body() shareDto: ShareAlbumDto,
  ) {
    return this.albumsService.shareAlbum(userId, albumId, shareDto);
  }

  /**
   * Get shared album (public - no auth)
   * GET /api/v1/albums/shared/:token?password=xxx
   */
  @Get('shared/:token')
  async getSharedAlbum(
    @Param('token') shareToken: string,
    @Query('password') password?: string,
  ) {
    return this.albumsService.getSharedAlbum(shareToken, password);
  }

  /**
   * Remove share (stop sharing)
   * DELETE /api/v1/albums/:id/share
   */
  @Delete(':id/share')
  @UseGuards(JwtAuthGuard)
  async removeShare(
    @GetUser('id') userId: string,
    @Param('id') albumId: string,
  ) {
    return this.albumsService.removeShare(userId, albumId);
  }
}
