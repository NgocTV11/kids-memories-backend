import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageProcessor } from './helpers/image-processor';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { TagKidsDto } from './dto/tag-kids.dto';
import { buildFamilyAccessWhere } from '../common/helpers/family-access.helper';

@Injectable()
export class PhotosService {
  private imageProcessor: ImageProcessor;

  constructor(private prisma: PrismaService) {
    this.imageProcessor = new ImageProcessor();
  }

  /**
   * Upload a new photo
   */
  async upload(
    file: Express.Multer.File,
    userId: string,
    albumId: string,
    uploadDto: UploadPhotoDto,
    userRole: string = 'user',
  ) {
    // Parse kids_tagged and tags if they come as JSON strings from FormData
    let kidsTagged: string[] = [];
    let tags: string[] = [];

    if (uploadDto.kids_tagged) {
      if (typeof uploadDto.kids_tagged === 'string') {
        try {
          kidsTagged = JSON.parse(uploadDto.kids_tagged as any);
        } catch {
          kidsTagged = [];
        }
      } else if (Array.isArray(uploadDto.kids_tagged)) {
        kidsTagged = uploadDto.kids_tagged;
      }
    }

    if (uploadDto.tags) {
      if (typeof uploadDto.tags === 'string') {
        try {
          tags = JSON.parse(uploadDto.tags as any);
        } catch {
          tags = [];
        }
      } else if (Array.isArray(uploadDto.tags)) {
        tags = uploadDto.tags;
      }
    }

    // Verify album access (ownership or family membership)
    // Admin có quyền truy cập tất cả albums
    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        is_deleted: false,
        ...(userRole !== 'admin' && {
          OR: [
            // Option 1: User owns the album
            {
              created_by: userId,
            },
            // Option 2: Album belongs to a family that user is member of
            {
              family: {
                members: {
                  some: {
                    user_id: userId,
                    status: 'active',
                  },
                },
              },
            },
          ],
        }),
      },
    });

    if (!album) {
      throw new NotFoundException('Album not found or you do not have access');
    }

    // Process image (create thumbnail, medium versions)
    const imageResult = await this.imageProcessor.processImage(
      file.buffer,
      file.originalname,
    );

    // Extract EXIF data
    const exifData = await this.imageProcessor.extractExifData(file.buffer);

    // Validate kids_tagged if provided
    if (kidsTagged.length > 0) {
      await this.validateKidsAccess(userId, kidsTagged);
    }

    // Parse date_taken if provided
    let dateTaken: Date | null = null;
    if (uploadDto.date_taken) {
      dateTaken = new Date(uploadDto.date_taken);
      if (isNaN(dateTaken.getTime())) {
        throw new BadRequestException('Invalid date_taken format');
      }
    }

    // Create photo record
    const photo = await this.prisma.photos.create({
      data: {
        album: {
          connect: {
            id: albumId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        file_url: imageResult.originalUrl,
        thumbnail_url: imageResult.thumbnailUrl,
        medium_url: imageResult.mediumUrl,
        caption: uploadDto.caption || null,
        date_taken: dateTaken,
        exif_data: exifData,
        kids_tagged: kidsTagged,
        tags: tags,
      },
      include: {
        album: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Auto-set album cover if it doesn't have one
    if (!album.cover_photo_url) {
      await this.prisma.albums.update({
        where: { id: albumId },
        data: { cover_photo_url: imageResult.thumbnailUrl },
      });
    }

    return {
      ...photo,
      likes_count: photo._count.likes,
      comments_count: photo._count.comments,
      _count: undefined,
    };
  }

  /**
   * Find all photos (with optional filters) - with family access
   */
  async findAll(
    userId: string,
    albumId?: string,
    kidId?: string,
    limit: number = 50,
    offset: number = 0,
    userRole?: string,
  ) {
    // Build family access where clause
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const where: any = {
      is_deleted: false,
      album: {
        is_deleted: false,
        ...familyWhere,
      },
    };

    if (albumId) {
      // Verify album access first
      const album = await this.prisma.albums.findFirst({
        where: {
          id: albumId,
          ...familyWhere,
        },
      });
      if (!album) {
        throw new NotFoundException('Album not found or you do not have access');
      }
      where.album_id = albumId;
    }

    if (kidId) {
      // Verify kid access first
      const kid = await this.prisma.kids.findFirst({
        where: {
          id: kidId,
          ...familyWhere,
        },
      });
      if (!kid) {
        throw new NotFoundException('Kid not found or you do not have access');
      }
      // Search in JSONB array
      where.kids_tagged = {
        array_contains: [kidId],
      };
    }

    const [photos, total] = await Promise.all([
      this.prisma.photos.findMany({
        where,
        include: {
          album: {
            select: {
              id: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              display_name: true,
              avatar_url: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: [{ date_taken: 'desc' }, { created_at: 'desc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.photos.count({ where }),
    ]);

    const result = photos.map((photo: any) => ({
      ...photo,
      likes_count: photo._count?.likes || 0,
      comments_count: photo._count?.comments || 0,
      _count: undefined,
    }));

    return {
      data: result,
      total,
      limit,
      offset,
    };
  }

  /**
   * Find one photo by ID - with family access
   */
  async findOne(userId: string, photoId: string, userRole?: string) {
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
        album: {
          is_deleted: false,
          ...familyWhere,
        },
      },
      include: {
        album: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found or you do not have access');
    }

    // Increment view count
    await this.prisma.photos.update({
      where: { id: photoId },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    return {
      ...photo,
      likes_count: photo._count.likes,
      comments_count: photo._count.comments,
      _count: undefined,
    };
  }

  /**
   * Update photo metadata
   */
  async update(userId: string, photoId: string, updateDto: UpdatePhotoDto) {
    // Check ownership
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

    // Validate kids_tagged if provided
    if (updateDto.kids_tagged && updateDto.kids_tagged.length > 0) {
      await this.validateKidsAccess(userId, updateDto.kids_tagged);
    }

    // Parse date_taken if provided
    let dateTaken: Date | null | undefined;
    if (updateDto.date_taken !== undefined) {
      if (updateDto.date_taken) {
        dateTaken = new Date(updateDto.date_taken);
        if (isNaN(dateTaken.getTime())) {
          throw new BadRequestException('Invalid date_taken format');
        }
      } else {
        dateTaken = null;
      }
    }

    const updated = await this.prisma.photos.update({
      where: { id: photoId },
      data: {
        caption: updateDto.caption,
        date_taken: dateTaken,
        kids_tagged: updateDto.kids_tagged,
        tags: updateDto.tags,
      },
      include: {
        album: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return {
      ...updated,
      likes_count: updated._count.likes,
      comments_count: updated._count.comments,
      _count: undefined,
    };
  }

  /**
   * Soft delete a photo
   */
  async remove(userId: string, photoId: string) {
    // Check ownership
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

    // Soft delete
    await this.prisma.photos.update({
      where: { id: photoId },
      data: {
        is_deleted: true,
      },
    });

    // Optional: Delete physical files
    // await this.imageProcessor.deletePhotoFiles(
    //   photo.file_url,
    //   photo.thumbnail_url,
    //   photo.medium_url,
    // );

    return {
      message: 'Photo deleted successfully',
    };
  }

  /**
   * Tag kids in a photo
   */
  async tagKids(userId: string, photoId: string, tagKidsDto: TagKidsDto) {
    // Check ownership
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

    // Validate kids access
    await this.validateKidsAccess(userId, tagKidsDto.kids_tagged);

    // Update kids_tagged
    const updated = await this.prisma.photos.update({
      where: { id: photoId },
      data: {
        kids_tagged: tagKidsDto.kids_tagged,
      },
      include: {
        album: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return {
      ...updated,
      likes_count: updated._count.likes,
      comments_count: updated._count.comments,
      _count: undefined,
    };
  }

  /**
   * Like a photo
   */
  async like(userId: string, photoId: string) {
    // Check if photo exists and accessible
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

    // Check if already liked
    const existingLike = await this.prisma.likes.findFirst({
      where: {
        user_id: userId,
        photo_id: photoId,
      },
    });

    if (existingLike) {
      return {
        message: 'Photo already liked',
        liked: true,
      };
    }

    // Create like and increment likes_count in a transaction
    await this.prisma.$transaction(async (prisma) => {
      // Create like
      await prisma.likes.create({
        data: {
          user_id: userId,
          photo_id: photoId,
        },
      });

      // Increment likes_count
      await prisma.photos.update({
        where: { id: photoId },
        data: {
          likes_count: {
            increment: 1,
          },
        },
      });
    });

    return {
      message: 'Photo liked successfully',
      liked: true,
    };
  }

  /**
   * Unlike a photo
   */
  async unlike(userId: string, photoId: string) {
    // Check if photo exists
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Find and delete like if exists
    const existingLike = await this.prisma.likes.findFirst({
      where: {
        user_id: userId,
        photo_id: photoId,
      },
    });

    if (existingLike) {
      // Delete like and decrement likes_count in a transaction
      await this.prisma.$transaction(async (prisma) => {
        // Delete like
        await prisma.likes.delete({
          where: {
            id: existingLike.id,
          },
        });

        // Decrement likes_count (but not below 0)
        await prisma.photos.update({
          where: { id: photoId },
          data: {
            likes_count: {
              decrement: 1,
            },
          },
        });
      });

      return {
        message: 'Photo unliked successfully',
        liked: false,
      };
    }

    return {
      message: 'Photo was not liked',
      liked: false,
    };
  }

  /**
   * Check if user liked a photo
   */
  async checkIfLiked(userId: string, photoId: string) {
    // Check if photo exists
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Check if user liked this photo
    const existingLike = await this.prisma.likes.findFirst({
      where: {
        user_id: userId,
        photo_id: photoId,
      },
    });

    return {
      isLiked: !!existingLike,
    };
  }

  /**
   * Get all comments for a photo
   */
  async getComments(userId: string, photoId: string) {
    // Check if photo exists and accessible
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Get comments with user info
    const comments = await this.prisma.comments.findMany({
      where: {
        photo_id: photoId,
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
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return comments;
  }

  /**
   * Add a comment to a photo
   */
  async addComment(userId: string, photoId: string, content: string) {
    // Check if photo exists
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Create comment and increment comments_count in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create comment
      const comment = await prisma.comments.create({
        data: {
          photo_id: photoId,
          user_id: userId,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              avatar_url: true,
            },
          },
        },
      });

      // Increment comments_count
      await prisma.photos.update({
        where: { id: photoId },
        data: {
          comments_count: {
            increment: 1,
          },
        },
      });

      return comment;
    });

    return result;
  }

  /**
   * Track photo view
   */
  async trackView(photoId: string) {
    // Check if photo exists
    const photo = await this.prisma.photos.findFirst({
      where: {
        id: photoId,
        is_deleted: false,
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Increment view_count
    const updatedPhoto = await this.prisma.photos.update({
      where: { id: photoId },
      data: {
        view_count: {
          increment: 1,
        },
      },
      select: {
        view_count: true,
      },
    });

    return {
      message: 'View tracked successfully',
      view_count: updatedPhoto.view_count,
    };
  }

  /**
   * Validate that all kids belong to the user
   */
  private async validateKidsAccess(userId: string, kidIds: string[]) {
    const kids = await this.prisma.kids.findMany({
      where: {
        id: {
          in: kidIds,
        },
        user: {
          id: userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (kids.length !== kidIds.length) {
      throw new ForbiddenException(
        'Some kids do not exist or you do not have access',
      );
    }
  }
}
