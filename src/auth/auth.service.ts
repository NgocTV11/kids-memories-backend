import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, display_name } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.users.create({
      data: {
        email,
        password_hash,
        display_name,
        role: 'family_member',
        language: 'vi',
      },
      select: {
        id: true,
        email: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        created_at: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        display_name: true,
        avatar_url: true,
        role: true,
        language: true,
        is_deleted: true,
      },
    });

    if (!user || user.is_deleted) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.password_hash) {
      throw new BadRequestException(
        'Tài khoản này chưa có mật khẩu, vui lòng liên hệ quản trị viên',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Update last login
    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        is_deleted: true,
      },
    });

    if (!user || user.is_deleted) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, display_name: true, is_deleted: true },
    });

    // Always return success message (security: don't reveal if email exists)
    if (!user || user.is_deleted) {
      return {
        message:
          'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút',
      };
    }

    // Generate reset token (random 32-byte hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save hashed token to database
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        reset_password_token: hashedToken,
        reset_password_expires: expiresAt,
      },
    });

    // Send password reset email
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    try {
      const emailSent = await this.emailService.sendPasswordResetEmail(
        email,
        resetUrl,
        user.display_name,
      );

      if (emailSent) {
        console.log('✅ Password reset email sent to:', email);
      } else {
        // If email fails, still log for development
        console.log('⚠️  Email sending disabled. Reset URL:', resetUrl);
        console.log('   Expires:', expiresAt.toISOString());
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      // Don't throw error - we don't want to reveal if email exists
    }

    return {
      message:
        'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút',
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.prisma.users.findFirst({
      where: {
        reset_password_token: hashedToken,
        reset_password_expires: {
          gt: new Date(), // Token not expired
        },
        is_deleted: false,
      },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new BadRequestException(
        'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    // Hash new password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    console.log('✅ Password reset successful for:', user.email);

    return {
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập ngay.',
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: userId, email, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
