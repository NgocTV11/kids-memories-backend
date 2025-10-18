import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadVideoDto {
  @ApiPropertyOptional({ description: 'Title of the video' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the video' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Kid ID to associate video with' })
  @IsOptional()
  @IsUUID()
  kidId?: string;

  @ApiPropertyOptional({ description: 'Album ID to associate video with' })
  @IsOptional()
  @IsUUID()
  albumId?: string;
}

export class VideoResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  thumbnailUrl: string;

  @ApiPropertyOptional()
  duration?: number;

  @ApiProperty()
  fileSize: bigint;

  @ApiProperty()
  mimeType: string;

  @ApiPropertyOptional()
  codec?: string;

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiPropertyOptional()
  bitrate?: number;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
