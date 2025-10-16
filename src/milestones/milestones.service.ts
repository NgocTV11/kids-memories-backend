import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AttachPhotosDto } from './dto/attach-photos.dto';
import { buildFamilyAccessWhere } from '../common/helpers/family-access.helper';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new milestone - with family access
   */
  async create(userId: string, createMilestoneDto: CreateMilestoneDto, userRole?: string) {
    const { kid_id, title, description, milestone_date, category, photo_ids } =
      createMilestoneDto;

    // Verify kid access (ownership or family membership)
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kid_id,
        ...familyWhere,
      },
    });

    if (!kid) {
      throw new NotFoundException('Kid not found or you do not have access');
    }

    // Parse milestone date
    const parsedDate = new Date(milestone_date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid milestone_date format');
    }

    // Create milestone
    const milestone = await this.prisma.milestones.create({
      data: {
        kid: {
          connect: {
            id: kid_id,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        title,
        description,
        milestone_date: parsedDate,
        category,
      },
      include: {
        kid: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
      },
    });

    // Attach photos if provided
    if (photo_ids && photo_ids.length > 0) {
      await this.attachPhotosToMilestone(
        userId,
        milestone.id,
        kid_id,
        photo_ids,
      );
    }

    // Get milestone with photos
    return this.findOne(userId, milestone.id);
  }

  /**
   * Get all milestones (with optional kid filter) - with family access
   */
  async findAll(userId: string, kidId?: string, userRole?: string) {
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const where: any = familyWhere;

    if (kidId) {
      // Verify kid access
      const kid = await this.prisma.kids.findFirst({
        where: {
          id: kidId,
          ...familyWhere,
        },
      });

      if (!kid) {
        throw new NotFoundException('Kid not found or you do not have access');
      }

      where.kid_id = kidId;
    }

    const milestones = await this.prisma.milestones.findMany({
      where,
      include: {
        kid: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
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
            milestone_photos: true,
          },
        },
      },
      orderBy: {
        milestone_date: 'desc',
      },
    });

    return milestones.map((milestone) => ({
      ...milestone,
      photos_count: milestone._count.milestone_photos,
      _count: undefined,
    }));
  }

  /**
   * Get a single milestone with photos - with family access
   */
  async findOne(userId: string, milestoneId: string, userRole?: string) {
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const milestone = await this.prisma.milestones.findFirst({
      where: {
        id: milestoneId,
        ...familyWhere,
      },
      include: {
        kid: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            date_of_birth: true,
          },
        },
        user: {
          select: {
            id: true,
            display_name: true,
            avatar_url: true,
          },
        },
        milestone_photos: {
          include: {
            photo: {
              select: {
                id: true,
                file_url: true,
                thumbnail_url: true,
                medium_url: true,
                caption: true,
                date_taken: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found or you do not have access');
    }

    return {
      ...milestone,
      photos: milestone.milestone_photos.map((mp) => mp.photo),
      milestone_photos: undefined,
    };
  }

  /**
   * Update a milestone
   */
  async update(
    userId: string,
    milestoneId: string,
    updateMilestoneDto: UpdateMilestoneDto,
  ) {
    // Check ownership
    const milestone = await this.prisma.milestones.findFirst({
      where: {
        id: milestoneId,
        user: {
          id: userId,
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found or you do not have access');
    }

    // If updating kid_id, verify new kid ownership
    if (updateMilestoneDto.kid_id && updateMilestoneDto.kid_id !== milestone.kid_id) {
      const kid = await this.prisma.kids.findFirst({
        where: {
          id: updateMilestoneDto.kid_id,
          user: {
            id: userId,
          },
        },
      });

      if (!kid) {
        throw new NotFoundException('Kid not found or you do not have access');
      }
    }

    // Parse milestone_date if provided
    let parsedDate: Date | undefined;
    if (updateMilestoneDto.milestone_date) {
      parsedDate = new Date(updateMilestoneDto.milestone_date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid milestone_date format');
      }
    }

    // Update milestone
    await this.prisma.milestones.update({
      where: { id: milestoneId },
      data: {
        kid_id: updateMilestoneDto.kid_id,
        title: updateMilestoneDto.title,
        description: updateMilestoneDto.description,
        milestone_date: parsedDate,
        category: updateMilestoneDto.category,
      },
    });

    // If photo_ids provided, replace all attached photos
    if (updateMilestoneDto.photo_ids !== undefined) {
      // Delete existing attachments
      await this.prisma.milestone_photos.deleteMany({
        where: { milestone_id: milestoneId },
      });

      // Attach new photos
      if (updateMilestoneDto.photo_ids.length > 0) {
        await this.attachPhotosToMilestone(
          userId,
          milestoneId,
          updateMilestoneDto.kid_id || milestone.kid_id,
          updateMilestoneDto.photo_ids,
        );
      }
    }

    return this.findOne(userId, milestoneId);
  }

  /**
   * Delete a milestone
   */
  async remove(userId: string, milestoneId: string) {
    // Check ownership
    const milestone = await this.prisma.milestones.findFirst({
      where: {
        id: milestoneId,
        user: {
          id: userId,
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found or you do not have access');
    }

    // Delete milestone (CASCADE will delete milestone_photos)
    await this.prisma.milestones.delete({
      where: { id: milestoneId },
    });

    return {
      message: 'Milestone deleted successfully',
    };
  }

  /**
   * Attach photos to a milestone
   */
  async attachPhotos(
    userId: string,
    milestoneId: string,
    attachPhotosDto: AttachPhotosDto,
  ) {
    // Check ownership
    const milestone = await this.prisma.milestones.findFirst({
      where: {
        id: milestoneId,
        user: {
          id: userId,
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found or you do not have access');
    }

    await this.attachPhotosToMilestone(
      userId,
      milestoneId,
      milestone.kid_id,
      attachPhotosDto.photo_ids,
    );

    return this.findOne(userId, milestoneId);
  }

  /**
   * Remove photos from a milestone
   */
  async detachPhotos(
    userId: string,
    milestoneId: string,
    attachPhotosDto: AttachPhotosDto,
  ) {
    // Check ownership
    const milestone = await this.prisma.milestones.findFirst({
      where: {
        id: milestoneId,
        user: {
          id: userId,
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found or you do not have access');
    }

    // Delete specific photo attachments
    await this.prisma.milestone_photos.deleteMany({
      where: {
        milestone_id: milestoneId,
        photo_id: {
          in: attachPhotosDto.photo_ids,
        },
      },
    });

    return this.findOne(userId, milestoneId);
  }

  /**
   * Helper: Attach photos to milestone with validation
   */
  private async attachPhotosToMilestone(
    userId: string,
    milestoneId: string,
    kidId: string,
    photoIds: string[],
  ) {
    // Verify all photos exist and belong to user's albums
    const photos = await this.prisma.photos.findMany({
      where: {
        id: {
          in: photoIds,
        },
        is_deleted: false,
        album: {
          user: {
            id: userId,
          },
          is_deleted: false,
        },
      },
      select: {
        id: true,
      },
    });

    if (photos.length !== photoIds.length) {
      throw new ForbiddenException(
        'Some photos do not exist or you do not have access',
      );
    }

    // Create milestone_photos records (ignore duplicates)
    for (const photoId of photoIds) {
      try {
        await this.prisma.milestone_photos.create({
          data: {
            milestone_id: milestoneId,
            photo_id: photoId,
          },
        });
      } catch (error) {
        // Ignore duplicate errors (unique constraint)
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }
  }
}
