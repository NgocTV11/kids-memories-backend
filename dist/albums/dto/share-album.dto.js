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
exports.ShareAlbumDto = void 0;
const class_validator_1 = require("class-validator");
class ShareAlbumDto {
    password;
    expires_at;
}
exports.ShareAlbumDto = ShareAlbumDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu chia sẻ phải có ít nhất 6 ký tự' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Mật khẩu chia sẻ không được vượt quá 50 ký tự' }),
    __metadata("design:type", String)
], ShareAlbumDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày hết hạn không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShareAlbumDto.prototype, "expires_at", void 0);
//# sourceMappingURL=share-album.dto.js.map