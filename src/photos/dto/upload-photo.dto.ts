import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Caption không được vượt quá 1000 ký tự' })
  caption?: string;

  @IsDateString({}, { message: 'Ngày chụp không hợp lệ' })
  @IsOptional()
  date_taken?: string;

  @IsOptional()
  kids_tagged?: string[]; // Array of kid IDs

  @IsOptional()
  tags?: string[];
}
