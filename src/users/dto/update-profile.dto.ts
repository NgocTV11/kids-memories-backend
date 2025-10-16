import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Tên hiển thị phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên hiển thị không được quá 100 ký tự' })
  display_name?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @IsIn(['vi', 'en'], { message: 'Ngôn ngữ chỉ có thể là vi hoặc en' })
  language?: string;
}
