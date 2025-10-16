import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsUUID('4')
  kid_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNotEmpty()
  @IsDateString()
  milestone_date: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  category: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  photo_ids?: string[];
}
