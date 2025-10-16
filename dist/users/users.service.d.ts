import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        email: string;
        display_name: string;
        id: string;
        avatar_url: string | null;
        role: string;
        language: string;
        created_at: Date;
        last_login: Date | null;
    }>;
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<{
        email: string;
        display_name: string;
        id: string;
        avatar_url: string | null;
        role: string;
        language: string;
        updated_at: Date;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getAllUsers(currentUserId: string): Promise<{
        email: string;
        display_name: string;
        id: string;
        avatar_url: string | null;
        role: string;
        language: string;
        created_at: Date;
        last_login: Date | null;
    }[]>;
    getUserById(currentUserId: string, targetUserId: string): Promise<{
        email: string;
        display_name: string;
        id: string;
        avatar_url: string | null;
        role: string;
        language: string;
        created_at: Date;
        updated_at: Date;
        last_login: Date | null;
    }>;
    softDeleteUser(currentUserId: string, targetUserId: string): Promise<{
        message: string;
    }>;
}
