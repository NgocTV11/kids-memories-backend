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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
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
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        return user;
    }
    async updateProfile(userId, updateDto) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId, is_deleted: false },
        });
        if (!user) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
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
    async changePassword(userId, changePasswordDto) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId, is_deleted: false },
        });
        if (!user) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        if (!user.password_hash) {
            throw new common_1.BadRequestException('Tài khoản này chưa có mật khẩu, vui lòng liên hệ quản trị viên');
        }
        const isPasswordValid = await bcrypt.compare(changePasswordDto.current_password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Mật khẩu hiện tại không đúng');
        }
        const newPasswordHash = await bcrypt.hash(changePasswordDto.new_password, 12);
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: newPasswordHash,
                updated_at: new Date(),
            },
        });
        return { message: 'Đổi mật khẩu thành công' };
    }
    async getAllUsers(currentUserId) {
        const currentUser = await this.prisma.users.findUnique({
            where: { id: currentUserId },
        });
        if (!currentUser || currentUser.role !== 'admin') {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập chức năng này');
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
    async getUserById(currentUserId, targetUserId) {
        const currentUser = await this.prisma.users.findUnique({
            where: { id: currentUserId },
        });
        if (!currentUser || currentUser.role !== 'admin') {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập chức năng này');
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
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        return user;
    }
    async softDeleteUser(currentUserId, targetUserId) {
        const currentUser = await this.prisma.users.findUnique({
            where: { id: currentUserId },
        });
        if (!currentUser || currentUser.role !== 'admin') {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập chức năng này');
        }
        if (currentUserId === targetUserId) {
            throw new common_1.BadRequestException('Bạn không thể xóa chính mình');
        }
        const user = await this.prisma.users.findUnique({
            where: { id: targetUserId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        if (user.is_deleted) {
            throw new common_1.BadRequestException('Người dùng đã bị xóa trước đó');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map