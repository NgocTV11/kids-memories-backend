import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
