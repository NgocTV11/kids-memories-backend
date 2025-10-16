import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { buildFamilyAccessWhere } from '../common/helpers/family-access.helper';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get statistics for current user (includes family shared data)
   * GET /stats
   */
  @Get()
  async getStats(@GetUser('id') userId: string, @GetUser('role') userRole: string) {
    // Build where clause based on family access
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const [kidsCount, albumsCount, photosCount, milestonesCount, familiesCount] = await Promise.all([
      // Count kids (own + family shared)
      this.prisma.kids.count({
        where: familyWhere,
      }),
      
      // Count albums (own + family shared)
      this.prisma.albums.count({
        where: {
          ...familyWhere,
          is_deleted: false,
        },
      }),
      
      // Count photos (from albums with family access)
      this.prisma.photos.count({
        where: {
          is_deleted: false,
          album: {
            is_deleted: false,
            ...familyWhere,
          },
        },
      }),
      
      // Count milestones (from kids with family access)
      this.prisma.milestones.count({
        where: {
          kid: familyWhere,
        },
      }),

      // Count families (where user is owner or active member)
      this.prisma.families.count({
        where: {
          OR: [
            { owner_id: userId },
            {
              members: {
                some: {
                  user_id: userId,
                  status: 'active',
                },
              },
            },
          ],
          is_deleted: false,
        },
      }),
    ]);

    return {
      kids: kidsCount,
      albums: albumsCount,
      photos: photosCount,
      milestones: milestonesCount,
      families: familiesCount,
    };
  }
}
