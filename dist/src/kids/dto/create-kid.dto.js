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
exports.CreateKidDto = exports.Gender = void 0;
const class_validator_1 = require("class-validator");
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
class CreateKidDto {
    name;
    date_of_birth;
    gender;
    bio;
    profile_picture;
    family_id;
}
exports.CreateKidDto = CreateKidDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên không được để trống' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Tên không được vượt quá 100 ký tự' }),
    __metadata("design:type", String)
], CreateKidDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày sinh không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày sinh không được để trống' }),
    __metadata("design:type", String)
], CreateKidDto.prototype, "date_of_birth", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Gender, { message: 'Giới tính không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Giới tính không được để trống' }),
    __metadata("design:type", String)
], CreateKidDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Tiểu sử không được vượt quá 500 ký tự' }),
    __metadata("design:type", String)
], CreateKidDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateKidDto.prototype, "profile_picture", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateKidDto.prototype, "family_id", void 0);
//# sourceMappingURL=create-kid.dto.js.map