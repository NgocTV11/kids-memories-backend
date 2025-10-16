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
exports.AlbumsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const family_access_helper_1 = require("../common/helpers/family-access.helper");
let AlbumsService = class AlbumsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createAlbumDto, userRole) {
        if (createAlbumDto.kid_id) {
            const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
            const kid = await this.prisma.kids.findFirst({
                where: {
                    id: createAlbumDto.kid_id,
                    ...familyWhere,
                },
            });
            if (!kid) {
                throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
            }
        }
        if (createAlbumDto.family_id) {
            const hasAccess = await (0, family_access_helper_1.checkFamilyAccess)(this.prisma, userId, createAlbumDto.family_id);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bạn không có quyền tạo album trong family này');
            }
        }
        const albumData = {
            title: createAlbumDto.title,
            description: createAlbumDto.description,
            privacy_level: createAlbumDto.privacy_level,
            cover_photo_url: createAlbumDto.cover_photo_url,
            tags: createAlbumDto.tags || [],
            user: {
                connect: {
                    id: userId,
                },
            },
        };
        if (createAlbumDto.family_id) {
            albumData.family_id = createAlbumDto.family_id;
        }
        if (createAlbumDto.kid_id) {
            albumData.kid = {
                connect: {
                    id: createAlbumDto.kid_id,
                },
            };
        }
        const album = await this.prisma.albums.create({
            data: albumData,
            select: {
                id: true,
                title: true,
                description: true,
                kid_id: true,
                family_id: true,
                privacy_level: true,
                cover_photo_url: true,
                tags: true,
                created_at: true,
                kid: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                family: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return album;
    }
    async findAll(userId, kidId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const where = {
            ...familyWhere,
        };
        if (kidId) {
            where.kid_id = kidId;
        }
        const albums = await this.prisma.albums.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                kid_id: true,
                family_id: true,
                privacy_level: true,
                cover_photo_url: true,
                tags: true,
                created_at: true,
                kid: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                photos: {
                    select: {
                        id: true,
                        thumbnail_url: true,
                        is_deleted: true,
                    },
                    orderBy: {
                        created_at: 'asc',
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return albums.map((album) => {
            const activePhotos = album.photos.filter(p => !p.is_deleted);
            return {
                ...album,
                cover_photo_url: album.cover_photo_url || (activePhotos[0]?.thumbnail_url || null),
                photos: undefined,
                photos_count: activePhotos.length,
            };
        });
    }
    async findOne(userId, albumId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const album = await this.prisma.albums.findFirst({
            where: {
                id: albumId,
                ...familyWhere,
            },
            select: {
                id: true,
                title: true,
                description: true,
                kid_id: true,
                family_id: true,
                privacy_level: true,
                cover_photo_url: true,
                tags: true,
                created_at: true,
                updated_at: true,
                kid: {
                    select: {
                        id: true,
                        name: true,
                        date_of_birth: true,
                    },
                },
                family: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        photos: true,
                    },
                },
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
        }
        return {
            ...album,
            photo_count: album._count.photos,
            _count: undefined,
        };
    }
    async update(userId, albumId, updateAlbumDto, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const album = await this.prisma.albums.findFirst({
            where: {
                id: albumId,
                ...familyWhere,
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
        }
        if (updateAlbumDto.kid_id && updateAlbumDto.kid_id !== album.kid_id) {
            const kid = await this.prisma.kids.findFirst({
                where: {
                    id: updateAlbumDto.kid_id,
                    ...familyWhere,
                },
            });
            if (!kid) {
                throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
            }
        }
        if (updateAlbumDto.family_id && updateAlbumDto.family_id !== album.family_id) {
            const hasAccess = await (0, family_access_helper_1.checkFamilyAccess)(this.prisma, userId, updateAlbumDto.family_id);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bạn không có quyền chuyển album vào family này');
            }
        }
        const updatedAlbum = await this.prisma.albums.update({
            where: { id: albumId },
            data: {
                title: updateAlbumDto.title,
                description: updateAlbumDto.description,
                kid_id: updateAlbumDto.kid_id,
                family_id: updateAlbumDto.family_id,
                privacy_level: updateAlbumDto.privacy_level,
                cover_photo_url: updateAlbumDto.cover_photo_url,
                tags: updateAlbumDto.tags,
                updated_at: new Date(),
            },
            select: {
                id: true,
                title: true,
                description: true,
                kid_id: true,
                family_id: true,
                privacy_level: true,
                cover_photo_url: true,
                tags: true,
                updated_at: true,
            },
        });
        return updatedAlbum;
    }
    async remove(userId, albumId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const album = await this.prisma.albums.findFirst({
            where: {
                id: albumId,
                ...familyWhere,
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
        }
        await this.prisma.albums.delete({
            where: { id: albumId },
        });
        return { message: 'Xóa album thành công' };
    }
    async shareAlbum(userId, albumId, shareDto) {
        const album = await this.prisma.albums.findFirst({
            where: {
                id: albumId,
                user: {
                    id: userId,
                },
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
        }
        const shareToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const passwordHash = shareDto.password
            ? await bcrypt.hash(shareDto.password, 12)
            : null;
        const existingShare = await this.prisma.shares.findFirst({
            where: { album_id: albumId },
        });
        let share;
        if (existingShare) {
            share = await this.prisma.shares.update({
                where: { id: existingShare.id },
                data: {
                    share_token: shareToken,
                    password_hash: passwordHash,
                    expires_at: shareDto.expires_at ? new Date(shareDto.expires_at) : null,
                },
                select: {
                    share_token: true,
                    expires_at: true,
                    created_at: true,
                },
            });
        }
        else {
            share = await this.prisma.shares.create({
                data: {
                    album_id: albumId,
                    shared_by: userId,
                    share_token: shareToken,
                    password_hash: passwordHash,
                    expires_at: shareDto.expires_at ? new Date(shareDto.expires_at) : null,
                },
                select: {
                    share_token: true,
                    expires_at: true,
                    created_at: true,
                },
            });
        }
        return {
            message: 'Tạo liên kết chia sẻ thành công',
            share_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${share.share_token}`,
            share_token: share.share_token,
            password_protected: !!passwordHash,
            expires_at: share.expires_at,
        };
    }
    async getSharedAlbum(shareToken, password) {
        const share = await this.prisma.shares.findUnique({
            where: { share_token: shareToken },
        });
        if (!share) {
            throw new common_1.NotFoundException('Liên kết chia sẻ không tồn tại');
        }
        if (share.expires_at && new Date() > share.expires_at) {
            throw new common_1.ForbiddenException('Liên kết chia sẻ đã hết hạn');
        }
        if (share.password_hash) {
            if (!password) {
                throw new common_1.ForbiddenException('Album này yêu cầu mật khẩu');
            }
            const isPasswordValid = await bcrypt.compare(password, share.password_hash);
            if (!isPasswordValid) {
                throw new common_1.ForbiddenException('Mật khẩu không đúng');
            }
        }
        const album = await this.prisma.albums.findUnique({
            where: { id: share.album_id },
            select: {
                id: true,
                title: true,
                description: true,
                cover_photo_url: true,
                tags: true,
                created_at: true,
                kid: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                photos: {
                    select: {
                        id: true,
                        file_url: true,
                        thumbnail_url: true,
                        caption: true,
                        date_taken: true,
                        created_at: true,
                    },
                    where: { is_deleted: false },
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        return album;
    }
    async removeShare(userId, albumId) {
        const album = await this.prisma.albums.findFirst({
            where: {
                id: albumId,
                user: {
                    id: userId,
                },
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
        }
        await this.prisma.shares.deleteMany({
            where: { album_id: albumId },
        });
        return { message: 'Đã ngừng chia sẻ album' };
    }
};
exports.AlbumsService = AlbumsService;
exports.AlbumsService = AlbumsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlbumsService);
//# sourceMappingURL=albums.service.js.map