import { IsArray, IsUUID } from 'class-validator';

export class AttachPhotosDto {
  @IsArray()
  @IsUUID('4', { each: true })
  photo_ids: string[];
}
