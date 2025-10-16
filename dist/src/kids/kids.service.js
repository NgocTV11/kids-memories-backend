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
exports.KidsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const family_access_helper_1 = require("../common/helpers/family-access.helper");
let KidsService = class KidsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createKidDto) {
        if (createKidDto.family_id) {
            const hasAccess = await (0, family_access_helper_1.checkFamilyAccess)(this.prisma, userId, createKidDto.family_id);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bạn không có quyền thêm trẻ vào family này');
            }
        }
        const kidData = {
            name: createKidDto.name,
            date_of_birth: new Date(createKidDto.date_of_birth),
            gender: createKidDto.gender,
            bio: createKidDto.bio,
            profile_picture: createKidDto.profile_picture,
            user: {
                connect: {
                    id: userId,
                },
            },
        };
        if (createKidDto.family_id) {
            kidData.family_id = createKidDto.family_id;
        }
        const kid = await this.prisma.kids.create({
            data: kidData,
            select: {
                id: true,
                name: true,
                date_of_birth: true,
                gender: true,
                bio: true,
                profile_picture: true,
                growth_data: true,
                family_id: true,
                created_at: true,
            },
        });
        return kid;
    }
    async findAll(userId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const kids = await this.prisma.kids.findMany({
            where: familyWhere,
            select: {
                id: true,
                name: true,
                date_of_birth: true,
                gender: true,
                bio: true,
                profile_picture: true,
                growth_data: true,
                family_id: true,
                created_at: true,
                family: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        const kidsWithAge = kids.map((kid) => ({
            ...kid,
            age: this.calculateAge(kid.date_of_birth),
        }));
        return kidsWithAge;
    }
    async findOne(userId, kidId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const kid = await this.prisma.kids.findFirst({
            where: {
                id: kidId,
                ...familyWhere,
            },
            select: {
                id: true,
                name: true,
                date_of_birth: true,
                gender: true,
                bio: true,
                profile_picture: true,
                growth_data: true,
                family_id: true,
                created_at: true,
                updated_at: true,
                family: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!kid) {
            throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
        }
        return {
            ...kid,
            age: this.calculateAge(kid.date_of_birth),
        };
    }
    async update(userId, kidId, updateKidDto, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const kid = await this.prisma.kids.findFirst({
            where: {
                id: kidId,
                ...familyWhere,
            },
        });
        if (!kid) {
            throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
        }
        if (updateKidDto.family_id && updateKidDto.family_id !== kid.family_id) {
            const hasAccess = await (0, family_access_helper_1.checkFamilyAccess)(this.prisma, userId, updateKidDto.family_id);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Bạn không có quyền chuyển trẻ vào family này');
            }
        }
        const updatedKid = await this.prisma.kids.update({
            where: { id: kidId },
            data: {
                name: updateKidDto.name,
                date_of_birth: updateKidDto.date_of_birth
                    ? new Date(updateKidDto.date_of_birth)
                    : undefined,
                gender: updateKidDto.gender,
                bio: updateKidDto.bio,
                profile_picture: updateKidDto.profile_picture,
                family_id: updateKidDto.family_id,
                updated_at: new Date(),
            },
            select: {
                id: true,
                name: true,
                date_of_birth: true,
                gender: true,
                bio: true,
                profile_picture: true,
                growth_data: true,
                family_id: true,
                updated_at: true,
                family: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return {
            ...updatedKid,
            age: this.calculateAge(updatedKid.date_of_birth),
        };
    }
    async remove(userId, kidId) {
        const kid = await this.prisma.kids.findFirst({
            where: {
                id: kidId,
                user: {
                    id: userId,
                },
            },
        });
        if (!kid) {
            throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
        }
        await this.prisma.kids.delete({
            where: { id: kidId },
        });
        return { message: 'Xóa hồ sơ trẻ thành công' };
    }
    async addGrowthData(userId, kidId, growthDataDto) {
        const kid = await this.prisma.kids.findFirst({
            where: {
                id: kidId,
                user: {
                    id: userId,
                },
            },
        });
        if (!kid) {
            throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
        }
        const currentGrowthData = kid.growth_data || [];
        const newEntry = {
            date: growthDataDto.date,
            height: growthDataDto.height,
            weight: growthDataDto.weight,
            note: growthDataDto.note,
        };
        const updatedGrowthData = [...currentGrowthData, newEntry];
        updatedGrowthData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const updatedKid = await this.prisma.kids.update({
            where: { id: kidId },
            data: {
                growth_data: updatedGrowthData,
                updated_at: new Date(),
            },
            select: {
                id: true,
                name: true,
                growth_data: true,
            },
        });
        return {
            message: 'Thêm dữ liệu tăng trưởng thành công',
            kid: updatedKid,
        };
    }
    async getGrowthHistory(userId, kidId) {
        const kid = await this.prisma.kids.findFirst({
            where: {
                id: kidId,
                user: {
                    id: userId,
                },
            },
            select: {
                id: true,
                name: true,
                date_of_birth: true,
                growth_data: true,
            },
        });
        if (!kid) {
            throw new common_1.NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
        }
        const growthData = kid.growth_data || [];
        return {
            kid_id: kid.id,
            kid_name: kid.name,
            age: this.calculateAge(kid.date_of_birth),
            growth_history: growthData,
            total_entries: growthData.length,
        };
    }
    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        if (years > 0) {
            return `${years} tuổi ${months} tháng`;
        }
        else {
            return `${months} tháng`;
        }
    }
};
exports.KidsService = KidsService;
exports.KidsService = KidsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KidsService);
//# sourceMappingURL=kids.service.js.map