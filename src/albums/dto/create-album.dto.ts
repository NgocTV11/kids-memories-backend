import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum PrivacyLevel {
  PRIVATE = 'private',
  FAMILY = 'family',
  PUBLIC = 'public',
}

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(200, { message: 'Tiêu đề không được vượt quá 200 ký tự' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Mô tả không được vượt quá 2000 ký tự' })
  description?: string;

  @IsUUID('4', { message: 'ID trẻ không hợp lệ' })
  @IsOptional()
  kid_id?: string;

  @IsEnum(PrivacyLevel, { message: 'Mức độ riêng tư không hợp lệ' })
  @IsNotEmpty({ message: 'Mức độ riêng tư không được để trống' })
  privacy_level: PrivacyLevel;

  @IsString()
  @IsOptional()
  cover_photo_url?: string;

  @IsOptional()
  tags?: string[]; // Will be stored as JSONB

  @IsUUID('4', { message: 'ID family không hợp lệ' })
  @IsOptional()
  family_id?: string;
}
