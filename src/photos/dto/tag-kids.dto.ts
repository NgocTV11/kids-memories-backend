import { IsArray, IsUUID } from 'class-validator';

export class TagKidsDto {
  @IsArray({ message: 'kids_tagged phải là mảng' })
  @IsUUID('4', { each: true, message: 'Mỗi kid ID phải là UUID hợp lệ' })
  kids_tagged: string[];
}
