import { IsString, IsEnum, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  user_id: string;

  @IsEnum(['owner', 'admin', 'member'])
  role: 'owner' | 'admin' | 'member';

  @IsOptional()
  @IsString()
  relationship?: string; // ông, bà, bố, mẹ, con, etc.
}
