import { IsString, IsEnum } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  user_id: string;

  @IsEnum(['owner', 'admin', 'member'])
  role: 'owner' | 'admin' | 'member';
}
