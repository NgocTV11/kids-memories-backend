"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, display_name } = registerDto;
        const existingUser = await this.prisma.users.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email đã được sử dụng');
        }
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);
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
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            user,
            ...tokens,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
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
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (!user.password_hash) {
            throw new common_1.BadRequestException('Tài khoản này chưa có mật khẩu, vui lòng liên hệ quản trị viên');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        await this.prisma.users.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        const { password_hash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }
    async refreshToken(userId) {
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
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.generateTokens(user.id, user.email, user.role);
    }
    async getProfile(userId) {
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
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async generateTokens(userId, email, role) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map