import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class AddGrowthDataDto {
  @IsDateString({}, { message: 'Ngày đo không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày đo không được để trống' })
  date: string;

  @IsNumber({}, { message: 'Chiều cao phải là số' })
  @IsPositive({ message: 'Chiều cao phải lớn hơn 0' })
  @IsOptional()
  height?: number; // in cm

  @IsNumber({}, { message: 'Cân nặng phải là số' })
  @IsPositive({ message: 'Cân nặng phải lớn hơn 0' })
  @IsOptional()
  weight?: number; // in kg

  @IsOptional()
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string;
}
