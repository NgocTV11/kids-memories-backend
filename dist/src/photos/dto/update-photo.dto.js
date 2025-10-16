"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePhotoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const upload_photo_dto_1 = require("./upload-photo.dto");
class UpdatePhotoDto extends (0, mapped_types_1.PartialType)(upload_photo_dto_1.UploadPhotoDto) {
}
exports.UpdatePhotoDto = UpdatePhotoDto;
//# sourceMappingURL=update-photo.dto.js.map