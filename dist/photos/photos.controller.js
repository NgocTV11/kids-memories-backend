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
exports.PhotosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const photos_service_1 = require("./photos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const upload_photo_dto_1 = require("./dto/upload-photo.dto");
const update_photo_dto_1 = require("./dto/update-photo.dto");
const tag_kids_dto_1 = require("./dto/tag-kids.dto");
let PhotosController = class PhotosController {
    photosService;
    constructor(photosService) {
        this.photosService = photosService;
    }
    async upload(file, userId, albumId, uploadDto) {
        if (!file) {
            throw new common_1.BadRequestException('Photo file is required');
        }
        return this.photosService.upload(file, userId, albumId, uploadDto);
    }
    async findAll(userId, userRole, albumId, kidId, limit, offset) {
        const parsedLimit = limit ? parseInt(limit, 10) : 50;
        const parsedOffset = offset ? parseInt(offset, 10) : 0;
        return this.photosService.findAll(userId, albumId, kidId, parsedLimit, parsedOffset, userRole);
    }
    async findOne(userId, userRole, photoId) {
        return this.photosService.findOne(userId, photoId, userRole);
    }
    async update(userId, userRole, photoId, updateDto) {
        return this.photosService.update(userId, photoId, updateDto);
    }
    async remove(userId, photoId) {
        return this.photosService.remove(userId, photoId);
    }
    async tagKids(userId, photoId, tagKidsDto) {
        return this.photosService.tagKids(userId, photoId, tagKidsDto);
    }
    async like(userId, photoId) {
        return this.photosService.like(userId, photoId);
    }
    async unlike(userId, photoId) {
        return this.photosService.unlike(userId, photoId);
    }
    async checkIfLiked(userId, photoId) {
        return this.photosService.checkIfLiked(userId, photoId);
    }
    async getComments(userId, photoId) {
        return this.photosService.getComments(userId, photoId);
    }
    async addComment(userId, photoId, content) {
        if (!content || content.trim().length === 0) {
            throw new common_1.BadRequestException('Comment content is required');
        }
        if (content.length > 1000) {
            throw new common_1.BadRequestException('Comment content must not exceed 1000 characters');
        }
        return this.photosService.addComment(userId, photoId, content);
    }
    async trackView(userId, photoId) {
        return this.photosService.trackView(photoId);
    }
};
exports.PhotosController = PhotosController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
                return cb(new common_1.BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Query)('album_id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, upload_photo_dto_1.UploadPhotoDto]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Query)('album_id')),
    __param(3, (0, common_1.Query)('kid_id')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('role')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_photo_dto_1.UpdatePhotoDto]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/tag-kids'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, tag_kids_dto_1.TagKidsDto]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "tagKids", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "like", null);
__decorate([
    (0, common_1.Delete)(':id/like'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "unlike", null);
__decorate([
    (0, common_1.Get)(':id/like/check'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "checkIfLiked", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/views'),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PhotosController.prototype, "trackView", null);
exports.PhotosController = PhotosController = __decorate([
    (0, common_1.Controller)('photos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [photos_service_1.PhotosService])
], PhotosController);
//# sourceMappingURL=photos.controller.js.map