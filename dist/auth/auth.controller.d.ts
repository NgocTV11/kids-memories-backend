import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refreshToken(userId: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
