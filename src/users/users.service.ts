import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService, StorageFolder } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId, is_deleted: false },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        created_at: true,
        last_login: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId, is_deleted: false },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        display_name: updateDto.display_name,
        avatar_url: updateDto.avatar_url,
        language: updateDto.language,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        updated_at: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId, is_deleted: false },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (!user.password_hash) {
      throw new BadRequestException(
        'Tài khoản này chưa có mật khẩu, vui lòng liên hệ quản trị viên',
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.new_password,
      12,
    );

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(),
      },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId, is_deleted: false },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Upload to S3 or local storage
    const avatarUrl = await this.storageService.uploadFile(
      file,
      StorageFolder.AVATARS,
    );

    // Delete old avatar if exists
    if (user.avatar_url) {
      await this.storageService.deleteFile(user.avatar_url);
    }

    // Update user avatar
    await this.prisma.users.update({
      where: { id: userId },
      data: {
        avatar_url: avatarUrl,
        updated_at: new Date(),
      },
    });

    return {
      url: avatarUrl,
      message: 'Upload avatar thành công',
    };
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(currentUserId: string) {
    // Check if current user is admin
    const currentUser = await this.prisma.users.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    const users = await this.prisma.users.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        created_at: true,
        last_login: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return users;
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(currentUserId: string, targetUserId: string) {
    // Check if current user is admin
    const currentUser = await this.prisma.users.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: targetUserId, is_deleted: false },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        created_at: true,
        last_login: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return user;
  }

  /**
   * Soft delete user (Admin only)
   */
  async softDeleteUser(currentUserId: string, targetUserId: string) {
    // Check if current user is admin
    const currentUser = await this.prisma.users.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    // Prevent self-deletion
    if (currentUserId === targetUserId) {
      throw new BadRequestException('Bạn không thể xóa chính mình');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    if (user.is_deleted) {
      throw new BadRequestException('Người dùng đã bị xóa trước đó');
    }

    await this.prisma.users.update({
      where: { id: targetUserId },
      data: {
        is_deleted: true,
        updated_at: new Date(),
      },
    });

    return { message: 'Xóa người dùng thành công' };
  }
}
