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
exports.KidsController = void 0;
const common_1 = require("@nestjs/common");
const kids_service_1 = require("./kids.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const create_kid_dto_1 = require("./dto/create-kid.dto");
const update_kid_dto_1 = require("./dto/update-kid.dto");
const add_growth_data_dto_1 = require("./dto/add-growth-data.dto");
let KidsController = class KidsController {
    kidsService;
    constructor(kidsService) {
        this.kidsService = kidsService;
    }
    async create(userId, createKidDto) {
        return this.kidsService.create(userId, createKidDto);
    }
    async findAll(userId, userRole) {
        return this.kidsService.findAll(userId, userRole);
    }
    async findOne(userId, kidId, userRole) {
        return this.kidsService.findOne(userId, kidId, userRole);
    }
    async update(userId, kidId, updateKidDto, userRole) {
        return this.kidsService.update(userId, kidId, updateKidDto, userRole);
    }
    async remove(userId, kidId) {
        return this.kidsService.remove(userId, kidId);
    }
    async addGrowthData(userId, kidId, growthDataDto) {
        return this.kidsService.addGrowthData(userId, kidId, growthDataDto);
    }
    async getGrowthHistory(userId, kidId) {
        return this.kidsService.getGrowthHistory(userId, kidId);
    }
};
exports.KidsController = KidsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_kid_dto_1.CreateKidDto]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, get_user_decorator_1.GetUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_kid_dto_1.UpdateKidDto, String]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/growth'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_growth_data_dto_1.AddGrowthDataDto]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "addGrowthData", null);
__decorate([
    (0, common_1.Get)(':id/growth'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], KidsController.prototype, "getGrowthHistory", null);
exports.KidsController = KidsController = __decorate([
    (0, common_1.Controller)('kids'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kids_service_1.KidsService])
], KidsController);
//# sourceMappingURL=kids.controller.js.map