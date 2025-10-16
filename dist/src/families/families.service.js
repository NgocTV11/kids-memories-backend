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
exports.FamiliesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FamiliesService = class FamiliesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createFamilyDto) {
        const family = await this.prisma.families.create({
            data: {
                name: createFamilyDto.name,
                description: createFamilyDto.description,
                avatar_url: createFamilyDto.avatar_url,
                owner_id: userId,
                members: {
                    create: {
                        user_id: userId,
                        role: 'owner',
                        status: 'active',
                    },
                },
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
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                display_name: true,
                                email: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
            },
        });
        return family;
    }
    async findAll(userId) {
        const families = await this.prisma.families.findMany({
            where: {
                OR: [
                    { owner_id: userId },
                    {
                        members: {
                            some: {
                                user_id: userId,
                                status: 'active',
                            },
                        },
                    },
                ],
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
        });
        return families;
    }
    async findOne(userId, familyId) {
        const family = await this.prisma.families.findFirst({
            where: {
                id: familyId,
                OR: [
                    { owner_id: userId },
                    {
                        members: {
                            some: {
                                user_id: userId,
                                status: 'active',
                            },
                        },
                    },
                ],
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
                members: {
                    where: {
                        status: 'active',
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                display_name: true,
                                email: true,
                                avatar_url: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
        if (!family) {
            throw new common_1.NotFoundException('Family không tồn tại hoặc không có quyền truy cập');
        }
        return family;
    }
    async update(userId, familyId, updateFamilyDto) {
        const family = await this.prisma.families.findFirst({
            where: {
                id: familyId,
                is_deleted: false,
            },
            include: {
                members: {
                    where: {
                        user_id: userId,
                        status: 'active',
                    },
                },
            },
        });
        if (!family) {
            throw new common_1.NotFoundException('Family không tồn tại');
        }
        const member = family.members[0];
        if (family.owner_id !== userId && member?.role !== 'admin') {
            throw new common_1.ForbiddenException('Chỉ owner hoặc admin mới có thể chỉnh sửa family');
        }
        const updated = await this.prisma.families.update({
            where: { id: familyId },
            data: updateFamilyDto,
            include: {
                owner: {
                    select: {
                        id: true,
                        display_name: true,
                        email: true,
                        avatar_url: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                display_name: true,
                                email: true,
                                avatar_url: true,
                            },
                        },
                    },
                },
            },
        });
        return updated;
    }
    async remove(userId, familyId) {
        const family = await this.prisma.families.findFirst({
            where: {
                id: familyId,
                owner_id: userId,
                is_deleted: false,
            },
        });
        if (!family) {
            throw new common_1.NotFoundException('Family không tồn tại hoặc bạn không phải owner');
        }
        await this.prisma.families.update({
            where: { id: familyId },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
            },
        });
        return { message: 'Đã xóa family thành công' };
    }
    async inviteMember(userId, familyId, inviteMemberDto) {
        const family = await this.prisma.families.findFirst({
            where: {
                id: familyId,
                is_deleted: false,
            },
            include: {
                members: {
                    where: {
                        user_id: userId,
                        status: 'active',
                    },
                },
            },
        });
        if (!family) {
            throw new common_1.NotFoundException('Family không tồn tại');
        }
        const member = family.members[0];
        if (family.owner_id !== userId && member?.role !== 'admin') {
            throw new common_1.ForbiddenException('Chỉ owner hoặc admin mới có thể mời thành viên');
        }
        const targetUser = await this.prisma.users.findUnique({
            where: { id: inviteMemberDto.user_id },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User không tồn tại');
        }
        const existingMember = await this.prisma.family_members.findUnique({
            where: {
                family_id_user_id: {
                    family_id: familyId,
                    user_id: inviteMemberDto.user_id,
                },
            },
        });
        if (existingMember) {
            if (existingMember.status === 'active') {
                throw new common_1.BadRequestException('User đã là thành viên của family');
            }
            const updated = await this.prisma.family_members.update({
                where: { id: existingMember.id },
                data: {
                    role: inviteMemberDto.role,
                    status: 'pending',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            display_name: true,
                            email: true,
                            avatar_url: true,
                        },
                    },
                },
            });
            return updated;
        }
        const newMember = await this.prisma.family_members.create({
            data: {
                family_id: familyId,
                user_id: inviteMemberDto.user_id,
                role: inviteMemberDto.role,
                status: 'pending',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        email: true,
                        avatar_url: true,
                    },
                },
            },
        });
        return newMember;
    }
    async acceptInvitation(userId, familyId) {
        const invitation = await this.prisma.family_members.findUnique({
            where: {
                family_id_user_id: {
                    family_id: familyId,
                    user_id: userId,
                },
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Lời mời không tồn tại');
        }
        if (invitation.status === 'active') {
            throw new common_1.BadRequestException('Bạn đã là thành viên của family');
        }
        const updated = await this.prisma.family_members.update({
            where: { id: invitation.id },
            data: { status: 'active' },
            include: {
                family: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                display_name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        return updated;
    }
    async removeMember(userId, familyId, memberId) {
        const family = await this.prisma.families.findFirst({
            where: {
                id: familyId,
                is_deleted: false,
            },
            include: {
                members: {
                    where: {
                        user_id: userId,
                        status: 'active',
                    },
                },
            },
        });
        if (!family) {
            throw new common_1.NotFoundException('Family không tồn tại');
        }
        const requestingMember = family.members[0];
        if (family.owner_id !== userId && requestingMember?.role !== 'admin') {
            throw new common_1.ForbiddenException('Chỉ owner hoặc admin mới có thể xóa thành viên');
        }
        if (memberId === family.owner_id) {
            throw new common_1.BadRequestException('Không thể xóa owner khỏi family');
        }
        await this.prisma.family_members.deleteMany({
            where: {
                family_id: familyId,
                user_id: memberId,
            },
        });
        return { message: 'Đã xóa thành viên khỏi family' };
    }
    async leaveFamily(userId, familyId) {
        const family = await this.prisma.families.findUnique({
            where: { id: familyId },
        });
        if (!family) {
            throw new common_1.NotFoundException('Family không tồn tại');
        }
        if (family.owner_id === userId) {
            throw new common_1.BadRequestException('Owner không thể rời family. Hãy chuyển quyền owner hoặc xóa family');
        }
        await this.prisma.family_members.deleteMany({
            where: {
                family_id: familyId,
                user_id: userId,
            },
        });
        return { message: 'Đã rời family thành công' };
    }
    async getMyInvitations(userId) {
        const invitations = await this.prisma.family_members.findMany({
            where: {
                user_id: userId,
                status: 'pending',
            },
            include: {
                family: {
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
                            },
                        },
                    },
                },
            },
        });
        return invitations;
    }
};
exports.FamiliesService = FamiliesService;
exports.FamiliesService = FamiliesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FamiliesService);
//# sourceMappingURL=families.service.js.map