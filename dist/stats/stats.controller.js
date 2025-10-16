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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const family_access_helper_1 = require("../common/helpers/family-access.helper");
let StatsController = class StatsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(userId, userRole) {
        const familyWhere = await (0, family_access_helper_1.buildFamilyAccessWhere)(this.prisma, userId, userRole);
        const [kidsCount, albumsCount, photosCount, milestonesCount, familiesCount] = await Promise.all([
            this.prisma.kids.count({
                where: familyWhere,
            }),
            this.prisma.albums.count({
                where: {
                    ...familyWhere,
                    is_deleted: false,
                },
            }),
            this.prisma.photos.count({
                where: {
                    is_deleted: false,
                    album: {
                        is_deleted: false,
                        ...familyWhere,
                    },
                },
            }),
            this.prisma.milestones.count({
                where: {
                    kid: familyWhere,
                },
            }),
            this.prisma.families.count({
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
            }),
        ]);
        return {
            kids: kidsCount,
            albums: albumsCount,
            photos: photosCount,
            milestones: milestonesCount,
            families: familiesCount,
        };
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getStats", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map