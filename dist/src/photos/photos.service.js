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
exports.PhotosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const image_processor_1 = require("./helpers/image-processor");
const family_access_helper_1 = require("../common/helpers/family-access.helper");
let PhotosService = class PhotosService {
    prisma;
    imageProcessor;
    constructor(prisma) {
        this.prisma = prisma;
        this.imageProcessor = new image_processor_1.ImageProcessor();
    }
    async upload(file, userId, albumId, uploadDto) {
        let kidsTagged = [];
        let tags = [];
        if (uploadDto.kids_tagged) {
            if (typeof uploadDto.kids_tagged === 'string') {
                try {
                    kidsTagged = JSON.parse(uploadDto.kids_tagged);
                }
                catch {
                    kidsTagged = [];
                }
            }
            else if (Array.isArray(uploadDto.kids_tagged)) {
                kidsTagged = uploadDto.kids_tagged;
            }
        }
        if (uploadDto.tags) {
            if (typeof uploadDto.tags === 'string') {
                try {
                    tags = JSON.parse(uploadDto.tags);
                }
                catch {
                    tags = [];
                }
            }
            else if (Array.isArray(uploadDto.tags)) {
                tags = uploadDto.tags;
            }
        }
        const album = await this.prisma.albums.findFirst({
            where: {
                id: albumId,
                is_deleted: false,
                OR: [
                    {
                        created_by: userId,
                    },
                    {
                        family: {
                            members: {
                                some: {
                                    user_id: userId,
                                    status: 'active',
                                },
                            },
                        },
                    },
                ],
            },
        });
        if (!album) {
            throw new common_1.NotFoundException('Album not found or you do not have access');
        }
        const imageResult = await this.imageProcessor.processImage(file.buffer, file.originalname);
        const exifData = await this.imageProcessor.extractExifData(file.buffer);
        if (kidsTagged.length > 0) {
            await this.validateKidsAccess(userId, kidsTagged);
        }
        let dateTaken = null;
        if (uploadDto.date_taken) {
            dateTaken = new Date(uploadDto.date_taken);
            if (isNaN(dateTaken.getTime())) {
                throw new common_1.BadRequestException('Invalid date_taken format');
            }
        }
        const photo = await this.prisma.photos.create({
            data: {
                album: {
                    connect: {
                        id: albumId,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
                file_url: imageResult.originalUrl,
                thumbnail_url: imageResult.thumbnailUrl,
                medium_url: imageResult.mediumUrl,
                caption: uploadDto.caption || null,
                date_taken: dateTaken,
                exif_data: exifData,
                kids_tagged: kidsTagged,
                tags: tags,
            },
            include: {
                album: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        if (!album.cover_photo_url) {
            await this.prisma.albums.update({
                where: { id: albumId },
                data: { cover_photo_url: imageResult.thumbnailUrl },
            });
        }
        return {
            ...photo,
            likes_count: photo._count.likes,
            comments_count: photo._count.comments,
            _count: undefined,
        };
    }
    async findAll(userId, albumId, kidId, limit = 50, offset = 0, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const where = {
            is_deleted: false,
            album: {
                is_deleted: false,
                ...familyWhere,
            },
        };
        if (albumId) {
            const album = await this.prisma.albums.findFirst({
                where: {
                    id: albumId,
                    ...familyWhere,
                },
            });
            if (!album) {
                throw new common_1.NotFoundException('Album not found or you do not have access');
            }
            where.album_id = albumId;
        }
        if (kidId) {
            const kid = await this.prisma.kids.findFirst({
                where: {
                    id: kidId,
                    ...familyWhere,
                },
            });
            if (!kid) {
                throw new common_1.NotFoundException('Kid not found or you do not have access');
            }
            where.kids_tagged = {
                array_contains: [kidId],
            };
        }
        const [photos, total] = await Promise.all([
            this.prisma.photos.findMany({
                where,
                include: {
                    album: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            display_name: true,
                            avatar_url: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
                orderBy: [{ date_taken: 'desc' }, { created_at: 'desc' }],
                take: limit,
                skip: offset,
            }),
            this.prisma.photos.count({ where }),
        ]);
        const result = photos.map((photo) => ({
            ...photo,
            likes_count: photo._count?.likes || 0,
            comments_count: photo._count?.comments || 0,
            _count: undefined,
        }));
        return {
            data: result,
            total,
            limit,
            offset,
        };
    }
    async findOne(userId, photoId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
                album: {
                    is_deleted: false,
                    ...familyWhere,
                },
            },
            include: {
                album: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        await this.prisma.photos.update({
            where: { id: photoId },
            data: {
                view_count: {
                    increment: 1,
                },
            },
        });
        return {
            ...photo,
            likes_count: photo._count.likes,
            comments_count: photo._count.comments,
            _count: undefined,
        };
    }
    async update(userId, photoId, updateDto) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        if (updateDto.kids_tagged && updateDto.kids_tagged.length > 0) {
            await this.validateKidsAccess(userId, updateDto.kids_tagged);
        }
        let dateTaken;
        if (updateDto.date_taken !== undefined) {
            if (updateDto.date_taken) {
                dateTaken = new Date(updateDto.date_taken);
                if (isNaN(dateTaken.getTime())) {
                    throw new common_1.BadRequestException('Invalid date_taken format');
                }
            }
            else {
                dateTaken = null;
            }
        }
        const updated = await this.prisma.photos.update({
            where: { id: photoId },
            data: {
                caption: updateDto.caption,
                date_taken: dateTaken,
                kids_tagged: updateDto.kids_tagged,
                tags: updateDto.tags,
            },
            include: {
                album: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        return {
            ...updated,
            likes_count: updated._count.likes,
            comments_count: updated._count.comments,
            _count: undefined,
        };
    }
    async remove(userId, photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        await this.prisma.photos.update({
            where: { id: photoId },
            data: {
                is_deleted: true,
            },
        });
        return {
            message: 'Photo deleted successfully',
        };
    }
    async tagKids(userId, photoId, tagKidsDto) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        await this.validateKidsAccess(userId, tagKidsDto.kids_tagged);
        const updated = await this.prisma.photos.update({
            where: { id: photoId },
            data: {
                kids_tagged: tagKidsDto.kids_tagged,
            },
            include: {
                album: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        return {
            ...updated,
            likes_count: updated._count.likes,
            comments_count: updated._count.comments,
            _count: undefined,
        };
    }
    async like(userId, photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        const existingLike = await this.prisma.likes.findFirst({
            where: {
                user_id: userId,
                photo_id: photoId,
            },
        });
        if (existingLike) {
            return {
                message: 'Photo already liked',
                liked: true,
            };
        }
        await this.prisma.$transaction(async (prisma) => {
            await prisma.likes.create({
                data: {
                    user_id: userId,
                    photo_id: photoId,
                },
            });
            await prisma.photos.update({
                where: { id: photoId },
                data: {
                    likes_count: {
                        increment: 1,
                    },
                },
            });
        });
        return {
            message: 'Photo liked successfully',
            liked: true,
        };
    }
    async unlike(userId, photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        const existingLike = await this.prisma.likes.findFirst({
            where: {
                user_id: userId,
                photo_id: photoId,
            },
        });
        if (existingLike) {
            await this.prisma.$transaction(async (prisma) => {
                await prisma.likes.delete({
                    where: {
                        id: existingLike.id,
                    },
                });
                await prisma.photos.update({
                    where: { id: photoId },
                    data: {
                        likes_count: {
                            decrement: 1,
                        },
                    },
                });
            });
            return {
                message: 'Photo unliked successfully',
                liked: false,
            };
        }
        return {
            message: 'Photo was not liked',
            liked: false,
        };
    }
    async checkIfLiked(userId, photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        const existingLike = await this.prisma.likes.findFirst({
            where: {
                user_id: userId,
                photo_id: photoId,
            },
        });
        return {
            isLiked: !!existingLike,
        };
    }
    async getComments(userId, photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        const comments = await this.prisma.comments.findMany({
            where: {
                photo_id: photoId,
                is_deleted: false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return comments;
    }
    async addComment(userId, photoId, content) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        const result = await this.prisma.$transaction(async (prisma) => {
            const comment = await prisma.comments.create({
                data: {
                    photo_id: photoId,
                    user_id: userId,
                    content: content.trim(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            display_name: true,
                            avatar_url: true,
                        },
                    },
                },
            });
            await prisma.photos.update({
                where: { id: photoId },
                data: {
                    comments_count: {
                        increment: 1,
                    },
                },
            });
            return comment;
        });
        return result;
    }
    async trackView(photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found');
        }
        const updatedPhoto = await this.prisma.photos.update({
            where: { id: photoId },
            data: {
                view_count: {
                    increment: 1,
                },
            },
            select: {
                view_count: true,
            },
        });
        return {
            message: 'View tracked successfully',
            view_count: updatedPhoto.view_count,
        };
    }
    async validateKidsAccess(userId, kidIds) {
        const kids = await this.prisma.kids.findMany({
            where: {
                id: {
                    in: kidIds,
                },
                user: {
                    id: userId,
                },
            },
            select: {
                id: true,
            },
        });
        if (kids.length !== kidIds.length) {
            throw new common_1.ForbiddenException('Some kids do not exist or you do not have access');
        }
    }
};
exports.PhotosService = PhotosService;
exports.PhotosService = PhotosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PhotosService);
//# sourceMappingURL=photos.service.js.map