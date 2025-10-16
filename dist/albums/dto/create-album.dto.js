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
exports.CreateAlbumDto = exports.PrivacyLevel = void 0;
const class_validator_1 = require("class-validator");
var PrivacyLevel;
(function (PrivacyLevel) {
    PrivacyLevel["PRIVATE"] = "private";
    PrivacyLevel["FAMILY"] = "family";
    PrivacyLevel["PUBLIC"] = "public";
})(PrivacyLevel || (exports.PrivacyLevel = PrivacyLevel = {}));
class CreateAlbumDto {
    title;
    description;
    kid_id;
    privacy_level;
    cover_photo_url;
    tags;
    family_id;
}
exports.CreateAlbumDto = CreateAlbumDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tiêu đề không được để trống' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' }),
    __metadata("design:type", String)
], CreateAlbumDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000, { message: 'Mô tả không được vượt quá 2000 ký tự' }),
    __metadata("design:type", String)
], CreateAlbumDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID trẻ không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAlbumDto.prototype, "kid_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PrivacyLevel, { message: 'Mức độ riêng tư không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mức độ riêng tư không được để trống' }),
    __metadata("design:type", String)
], CreateAlbumDto.prototype, "privacy_level", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAlbumDto.prototype, "cover_photo_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAlbumDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID family không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAlbumDto.prototype, "family_id", void 0);
//# sourceMappingURL=create-album.dto.js.map