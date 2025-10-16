"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(page = 1, limit = 20) {
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
    async getAllFamilies(page = 1, limit = 20) {
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
    async getDashboardStats() {
        const [totalUsers, totalFamilies, totalKids, totalAlbums, totalPhotos, totalMilestones, recentUsers,] = await Promise.all([
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
    async updateUserRole(userId, role) {
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
    async deleteUser(userId) {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
            },
        });
        return { message: 'User đã được xóa thành công' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map