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
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Create a new comment or reply
   * POST /comments
   */
  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, createCommentDto);
  }

  /**
   * Get all comments for a photo (hierarchical)
   * GET /comments?photo_id=xxx
   */
  @Get()
  async findByPhoto(
    @GetUser('id') userId: string,
    @Query('photo_id', ParseUUIDPipe) photoId: string,
  ) {
    return this.commentsService.findByPhoto(userId, photoId);
  }

  /**
   * Get a single comment with replies
   * GET /comments/:id
   */
  @Get(':id')
  async findOne(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) commentId: string,
  ) {
    return this.commentsService.findOne(userId, commentId);
  }

  /**
   * Update a comment
   * PUT /comments/:id
   */
  @Put(':id')
  async update(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(userId, commentId, updateCommentDto);
  }

  /**
   * Delete a comment
   * DELETE /comments/:id
   */
  @Delete(':id')
  async remove(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) commentId: string,
  ) {
    return this.commentsService.remove(userId, commentId);
  }
}
