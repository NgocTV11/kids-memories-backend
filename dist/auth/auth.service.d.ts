import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            email: string;
            display_name: string;
            id: string;
            avatar_url: string | null;
            role: string;
            language: string;
            created_at: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            email: string;
            display_name: string;
            id: string;
            avatar_url: string | null;
            role: string;
            language: string;
            is_deleted: boolean;
        };
    }>;
    refreshToken(userId: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
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
    private generateTokens;
}
