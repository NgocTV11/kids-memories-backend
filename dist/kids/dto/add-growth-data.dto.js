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
exports.AddGrowthDataDto = void 0;
const class_validator_1 = require("class-validator");
class AddGrowthDataDto {
    date;
    height;
    weight;
    note;
}
exports.AddGrowthDataDto = AddGrowthDataDto;
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Ngày đo không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày đo không được để trống' }),
    __metadata("design:type", String)
], AddGrowthDataDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Chiều cao phải là số' }),
    (0, class_validator_1.IsPositive)({ message: 'Chiều cao phải lớn hơn 0' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddGrowthDataDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'Cân nặng phải là số' }),
    (0, class_validator_1.IsPositive)({ message: 'Cân nặng phải lớn hơn 0' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddGrowthDataDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500, { message: 'Ghi chú không được vượt quá 500 ký tự' }),
    __metadata("design:type", String)
], AddGrowthDataDto.prototype, "note", void 0);
//# sourceMappingURL=add-growth-data.dto.js.map