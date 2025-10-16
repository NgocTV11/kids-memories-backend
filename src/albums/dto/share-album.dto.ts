import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ShareAlbumDto {
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu chia sẻ phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu chia sẻ không được vượt quá 50 ký tự' })
  password?: string;

  @IsDateString({}, { message: 'Ngày hết hạn không hợp lệ' })
  @IsOptional()
  expires_at?: string;
}
