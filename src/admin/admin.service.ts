import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where: {
          is_deleted: false,
        },
        select: {
          id: true,
          email: true,
          display_name: true,
          avatar_url: true,
          role: true,
          created_at: true,
          last_login: true,
          _count: {
            select: {
              kids: true,
              albums: true,
              photos: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.users.count({
        where: {
          is_deleted: false,
        },
      }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all families (Admin only)
   */
  async getAllFamilies(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [families, total] = await Promise.all([
      this.prisma.families.findMany({
        where: {
          is_deleted: false,
        },
        include: {
          owner: {
            select: {
              id: true,
              display_name: true,
              email: true,
              avatar_url: true,
            },
          },
          _count: {
            select: {
              members: true,
              kids: true,
              albums: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.families.count({
        where: {
          is_deleted: false,
        },
      }),
    ]);

    return {
      data: families,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get dashboard statistics (Admin only)
   */
  async getDashboardStats() {
    const [
      totalUsers,
      totalFamilies,
      totalKids,
      totalAlbums,
      totalPhotos,
      totalMilestones,
      recentUsers,
    ] = await Promise.all([
      this.prisma.users.count({ where: { is_deleted: false } }),
      this.prisma.families.count({ where: { is_deleted: false } }),
      this.prisma.kids.count(),
      this.prisma.albums.count({ where: { is_deleted: false } }),
      this.prisma.photos.count({ where: { is_deleted: false } }),
      this.prisma.milestones.count(),
      this.prisma.users.findMany({
        where: { is_deleted: false },
        select: {
          id: true,
          email: true,
          display_name: true,
          avatar_url: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      totalFamilies,
      totalKids,
      totalAlbums,
      totalPhotos,
      totalMilestones,
      recentUsers,
    };
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.users.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        display_name: true,
        role: true,
      },
    });

    return user;
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string) {
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return { message: 'User đã được xóa thành công' };
  }
}
