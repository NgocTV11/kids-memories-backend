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
exports.UploadPhotoDto = void 0;
const class_validator_1 = require("class-validator");
class UploadPhotoDto {
    caption;
    date_taken;
    kids_tagged;
    tags;
}
exports.UploadPhotoDto = UploadPhotoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Caption không được vượt quá 1000 ký tự' }),
    __metadata("design:type", String)
], UploadPhotoDto.prototype, "caption", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày chụp không hợp lệ' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadPhotoDto.prototype, "date_taken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UploadPhotoDto.prototype, "kids_tagged", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UploadPhotoDto.prototype, "tags", void 0);
//# sourceMappingURL=upload-photo.dto.js.map