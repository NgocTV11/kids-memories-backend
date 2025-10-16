import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  @Get('me')
  async getProfile(@GetUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update current user profile
   * PUT /api/v1/users/me
   */
  @Put('me')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateDto);
  }

  /**
   * Change password
   * PUT /api/v1/users/me/password
   */
  @Put('me/password')
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  /**
   * Upload avatar
   * POST /api/v1/users/me/avatar
   */
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }

    return this.usersService.uploadAvatar(userId, file);
  }

  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  @Get()
  async getAllUsers(@GetUser('id') currentUserId: string) {
    return this.usersService.getAllUsers(currentUserId);
  }

  /**
   * Get user by ID (Admin only)
   * GET /api/v1/users/:id
   */
  @Get(':id')
  async getUserById(
    @GetUser('id') currentUserId: string,
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.getUserById(currentUserId, targetUserId);
  }

  /**
   * Delete user (Admin only)
   * DELETE /api/v1/users/:id
   */
  @Delete(':id')
  async deleteUser(
    @GetUser('id') currentUserId: string,
    @Param('id') targetUserId: string,
  ) {
    return this.usersService.softDeleteUser(currentUserId, targetUserId);
  }
}
