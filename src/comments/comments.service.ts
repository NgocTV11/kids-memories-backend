import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new comment or reply
   */
  async create(userId: string, createCommentDto: CreateCommentDto) {
    const { photo_id, content, parent_comment_id } = createCommentDto;

    // Verify photo exists and user has access
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photo_id,
        is_deleted: false,
        album: {
          user: {
            id: userId,
          },
          is_deleted: false,
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found or you do not have access');
    }

    // If replying to a comment, verify parent exists and belongs to same photo
    if (parent_comment_id) {
      const parentComment = await this.prisma.comments.findFirst({
        where: {
          id: parent_comment_id,
          photo_id: photo_id,
          is_deleted: false,
        },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found or does not belong to this photo');
      }
    }

    // Create comment
    const comment = await this.prisma.comments.create({
      data: {
        photo_id,
        user_id: userId,
        content,
        parent_comment_id,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return {
      ...comment,
      replies_count: comment._count.replies,
      _count: undefined,
    };
  }

  /**
   * Get all comments for a photo (hierarchical structure)
   */
  async findByPhoto(userId: string, photoId: string) {
    // Verify photo access
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
        album: {
          user: {
            id: userId,
          },
          is_deleted: false,
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found or you do not have access');
    }

    // Get all top-level comments (no parent)
    const topLevelComments = await this.prisma.comments.findMany({
      where: {
        photo_id: photoId,
        parent_comment_id: null,
        is_deleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // For each top-level comment, get its replies recursively
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const replies = await this.getReplies(comment.id);
        return {
          ...comment,
          replies_count: comment._count.replies,
          replies,
          _count: undefined,
        };
      }),
    );

    return commentsWithReplies;
  }

  /**
   * Get replies for a comment (recursive)
   */
  private async getReplies(commentId: string) {
    const replies = await this.prisma.comments.findMany({
      where: {
        parent_comment_id: commentId,
        is_deleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // Recursively get nested replies
    return Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await this.getReplies(reply.id);
        return {
          ...reply,
          replies_count: reply._count.replies,
          replies: nestedReplies,
          _count: undefined,
        };
      }),
    );
  }

  /**
   * Get a single comment by ID
   */
  async findOne(userId: string, commentId: string) {
    const comment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        is_deleted: false,
        photo: {
          is_deleted: false,
          album: {
            user: {
              id: userId,
            },
            is_deleted: false,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        photo: {
          select: {
            id: true,
            caption: true,
            thumbnail_url: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found or you do not have access');
    }

    // Get replies
    const replies = await this.getReplies(comment.id);

    return {
      ...comment,
      replies_count: comment._count.replies,
      replies,
      _count: undefined,
    };
  }

  /**
   * Update a comment
   */
  async update(userId: string, commentId: string, updateCommentDto: UpdateCommentDto) {
    // Check ownership
    const comment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        user_id: userId,
        is_deleted: false,
      },
    });

    if (!comment) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return {
      ...updated,
      replies_count: updated._count.replies,
      _count: undefined,
    };
  }

  /**
   * Soft delete a comment
   */
  async remove(userId: string, commentId: string) {
    // Check ownership
    const comment = await this.prisma.comments.findFirst({
      where: {
        id: commentId,
        user_id: userId,
        is_deleted: false,
      },
    });

    if (!comment) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete (keeps replies intact)
    await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        is_deleted: true,
      },
    });

    return {
      message: 'Comment deleted successfully',
    };
  }
}
