import { IsNotEmpty, IsString, IsUUID, MaxLength, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsUUID('4')
  photo_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000, { message: 'Comment content must not exceed 2000 characters' })
  content: string;

  @IsOptional()
  @IsUUID('4')
  parent_comment_id?: string;
}
