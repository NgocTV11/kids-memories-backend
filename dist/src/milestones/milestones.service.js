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
exports.MilestonesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_access_helper_1 = require("../common/helpers/family-access.helper");
let MilestonesService = class MilestonesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createMilestoneDto, userRole) {
        const { kid_id, title, description, milestone_date, category, photo_ids } = createMilestoneDto;
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const kid = await this.prisma.kids.findFirst({
            where: {
                id: kid_id,
                ...familyWhere,
            },
        });
        if (!kid) {
            throw new common_1.NotFoundException('Kid not found or you do not have access');
        }
        const parsedDate = new Date(milestone_date);
        if (isNaN(parsedDate.getTime())) {
            throw new common_1.BadRequestException('Invalid milestone_date format');
        }
        const milestone = await this.prisma.milestones.create({
            data: {
                kid: {
                    connect: {
                        id: kid_id,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
                title,
                description,
                milestone_date: parsedDate,
                category,
            },
            include: {
                kid: {
                    select: {
                        id: true,
                        name: true,
                        profile_picture: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
            },
        });
        if (photo_ids && photo_ids.length > 0) {
            await this.attachPhotosToMilestone(userId, milestone.id, kid_id, photo_ids);
        }
        return this.findOne(userId, milestone.id);
    }
    async findAll(userId, kidId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const where = familyWhere;
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
            where.kid_id = kidId;
        }
        const milestones = await this.prisma.milestones.findMany({
            where,
            include: {
                kid: {
                    select: {
                        id: true,
                        name: true,
                        profile_picture: true,
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
                        milestone_photos: true,
                    },
                },
            },
            orderBy: {
                milestone_date: 'desc',
            },
        });
        return milestones.map((milestone) => ({
            ...milestone,
            photos_count: milestone._count.milestone_photos,
            _count: undefined,
        }));
    }
    async findOne(userId, milestoneId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const milestone = await this.prisma.milestones.findFirst({
            where: {
                id: milestoneId,
                ...familyWhere,
            },
            include: {
                kid: {
                    select: {
                        id: true,
                        name: true,
                        profile_picture: true,
                        date_of_birth: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                milestone_photos: {
                    include: {
                        photo: {
                            select: {
                                id: true,
                                file_url: true,
                                thumbnail_url: true,
                                medium_url: true,
                                caption: true,
                                date_taken: true,
                            },
                        },
                    },
                },
            },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found or you do not have access');
        }
        return {
            ...milestone,
            photos: milestone.milestone_photos.map((mp) => mp.photo),
            milestone_photos: undefined,
        };
    }
    async update(userId, milestoneId, updateMilestoneDto) {
        const milestone = await this.prisma.milestones.findFirst({
            where: {
                id: milestoneId,
                user: {
                    id: userId,
                },
            },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found or you do not have access');
        }
        if (updateMilestoneDto.kid_id && updateMilestoneDto.kid_id !== milestone.kid_id) {
            const kid = await this.prisma.kids.findFirst({
                where: {
                    id: updateMilestoneDto.kid_id,
                    user: {
                        id: userId,
                    },
                },
            });
            if (!kid) {
                throw new common_1.NotFoundException('Kid not found or you do not have access');
            }
        }
        let parsedDate;
        if (updateMilestoneDto.milestone_date) {
            parsedDate = new Date(updateMilestoneDto.milestone_date);
            if (isNaN(parsedDate.getTime())) {
                throw new common_1.BadRequestException('Invalid milestone_date format');
            }
        }
        await this.prisma.milestones.update({
            where: { id: milestoneId },
            data: {
                kid_id: updateMilestoneDto.kid_id,
                title: updateMilestoneDto.title,
                description: updateMilestoneDto.description,
                milestone_date: parsedDate,
                category: updateMilestoneDto.category,
            },
        });
        if (updateMilestoneDto.photo_ids !== undefined) {
            await this.prisma.milestone_photos.deleteMany({
                where: { milestone_id: milestoneId },
            });
            if (updateMilestoneDto.photo_ids.length > 0) {
                await this.attachPhotosToMilestone(userId, milestoneId, updateMilestoneDto.kid_id || milestone.kid_id, updateMilestoneDto.photo_ids);
            }
        }
        return this.findOne(userId, milestoneId);
    }
    async remove(userId, milestoneId) {
        const milestone = await this.prisma.milestones.findFirst({
            where: {
                id: milestoneId,
                user: {
                    id: userId,
                },
            },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found or you do not have access');
        }
        await this.prisma.milestones.delete({
            where: { id: milestoneId },
        });
        return {
            message: 'Milestone deleted successfully',
        };
    }
    async attachPhotos(userId, milestoneId, attachPhotosDto) {
        const milestone = await this.prisma.milestones.findFirst({
            where: {
                id: milestoneId,
                user: {
                    id: userId,
                },
            },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found or you do not have access');
        }
        await this.attachPhotosToMilestone(userId, milestoneId, milestone.kid_id, attachPhotosDto.photo_ids);
        return this.findOne(userId, milestoneId);
    }
    async detachPhotos(userId, milestoneId, attachPhotosDto) {
        const milestone = await this.prisma.milestones.findFirst({
            where: {
                id: milestoneId,
                user: {
                    id: userId,
                },
            },
        });
        if (!milestone) {
            throw new common_1.NotFoundException('Milestone not found or you do not have access');
        }
        await this.prisma.milestone_photos.deleteMany({
            where: {
                milestone_id: milestoneId,
                photo_id: {
                    in: attachPhotosDto.photo_ids,
                },
            },
        });
        return this.findOne(userId, milestoneId);
    }
    async attachPhotosToMilestone(userId, milestoneId, kidId, photoIds) {
        const photos = await this.prisma.photos.findMany({
            where: {
                id: {
                    in: photoIds,
                },
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
            select: {
                id: true,
            },
        });
        if (photos.length !== photoIds.length) {
            throw new common_1.ForbiddenException('Some photos do not exist or you do not have access');
        }
        for (const photoId of photoIds) {
            try {
                await this.prisma.milestone_photos.create({
                    data: {
                        milestone_id: milestoneId,
                        photo_id: photoId,
                    },
                });
            }
            catch (error) {
                if (error.code !== 'P2002') {
                    throw error;
                }
            }
        }
    }
};
exports.MilestonesService = MilestonesService;
exports.MilestonesService = MilestonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MilestonesService);
//# sourceMappingURL=milestones.service.js.map