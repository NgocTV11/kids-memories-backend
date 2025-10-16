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
exports.MilestonesController = void 0;
const common_1 = require("@nestjs/common");
const milestones_service_1 = require("./milestones.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const create_milestone_dto_1 = require("./dto/create-milestone.dto");
const update_milestone_dto_1 = require("./dto/update-milestone.dto");
const attach_photos_dto_1 = require("./dto/attach-photos.dto");
let MilestonesController = class MilestonesController {
    milestonesService;
    constructor(milestonesService) {
        this.milestonesService = milestonesService;
    }
    async create(userId, userRole, createMilestoneDto) {
        return this.milestonesService.create(userId, createMilestoneDto, userRole);
    }
    async findAll(userId, userRole, kidId) {
        return this.milestonesService.findAll(userId, kidId, userRole);
    }
    async findOne(userId, userRole, milestoneId) {
        return this.milestonesService.findOne(userId, milestoneId, userRole);
    }
    async update(userId, userRole, milestoneId, updateMilestoneDto) {
        return this.milestonesService.update(userId, milestoneId, updateMilestoneDto);
    }
    async remove(userId, milestoneId) {
        return this.milestonesService.remove(userId, milestoneId);
    }
    async attachPhotos(userId, milestoneId, attachPhotosDto) {
        return this.milestonesService.attachPhotos(userId, milestoneId, attachPhotosDto);
    }
    async detachPhotos(userId, milestoneId, attachPhotosDto) {
        return this.milestonesService.detachPhotos(userId, milestoneId, attachPhotosDto);
    }
};
exports.MilestonesController = MilestonesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_milestone_dto_1.CreateMilestoneDto]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Query)('kid_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_milestone_dto_1.UpdateMilestoneDto]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/photos'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, attach_photos_dto_1.AttachPhotosDto]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "attachPhotos", null);
__decorate([
    (0, common_1.Delete)(':id/photos'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, attach_photos_dto_1.AttachPhotosDto]),
    __metadata("design:returntype", Promise)
], MilestonesController.prototype, "detachPhotos", null);
exports.MilestonesController = MilestonesController = __decorate([
    (0, common_1.Controller)('milestones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [milestones_service_1.MilestonesService])
], MilestonesController);
//# sourceMappingURL=milestones.controller.js.map