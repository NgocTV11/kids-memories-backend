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
exports.TagKidsDto = void 0;
const class_validator_1 = require("class-validator");
class TagKidsDto {
    kids_tagged;
}
exports.TagKidsDto = TagKidsDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'kids_tagged phải là mảng' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Mỗi kid ID phải là UUID hợp lệ' }),
    __metadata("design:type", Array)
], TagKidsDto.prototype, "kids_tagged", void 0);
//# sourceMappingURL=tag-kids.dto.js.map