import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private prisma;
    private storageService;
    constructor(prisma: PrismaService, storageService: StorageService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        display_name: string;
        avatar_url: string | null;
        role: string;
        language: string;
        created_at: Date;
        last_login: Date | null;
    }>;
    updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        display_name: string;
        avatar_url: string | null;
        role: string;
        language: string;
        updated_at: Date;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        url: string;
        message: string;
    }>;
    getAllUsers(currentUserId: string): Promise<{
        id: string;
        email: string;
        display_name: string;
        avatar_url: string | null;
        role: string;
        language: string;
        created_at: Date;
        last_login: Date | null;
    }[]>;
    getUserById(currentUserId: string, targetUserId: string): Promise<{
        id: string;
        email: string;
        display_name: string;
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
