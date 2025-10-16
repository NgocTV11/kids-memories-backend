import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  /**
   * Create a new family
   * POST /api/v1/families
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @GetUser('id') userId: string,
    @Body() createFamilyDto: CreateFamilyDto,
  ) {
    return this.familiesService.create(userId, createFamilyDto);
  }

  /**
   * Get all families for current user
   * GET /api/v1/families
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@GetUser('id') userId: string) {
    return this.familiesService.findAll(userId);
  }

  /**
   * Get my pending invitations
   * GET /api/v1/families/invitations
   */
  @Get('invitations')
  @UseGuards(JwtAuthGuard)
  async getMyInvitations(@GetUser('id') userId: string) {
    return this.familiesService.getMyInvitations(userId);
  }

  /**
   * Get one family by ID
   * GET /api/v1/families/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@GetUser('id') userId: string, @Param('id') familyId: string) {
    return this.familiesService.findOne(userId, familyId);
  }

  /**
   * Update family
   * PUT /api/v1/families/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @GetUser('id') userId: string,
    @Param('id') familyId: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
  ) {
    return this.familiesService.update(userId, familyId, updateFamilyDto);
  }

  /**
   * Delete family
   * DELETE /api/v1/families/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@GetUser('id') userId: string, @Param('id') familyId: string) {
    return this.familiesService.remove(userId, familyId);
  }

  /**
   * Invite member to family
   * POST /api/v1/families/:id/members
   */
  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async inviteMember(
    @GetUser('id') userId: string,
    @Param('id') familyId: string,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.familiesService.inviteMember(userId, familyId, inviteMemberDto);
  }

  /**
   * Accept invitation
   * POST /api/v1/families/:id/accept
   */
  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@GetUser('id') userId: string, @Param('id') familyId: string) {
    return this.familiesService.acceptInvitation(userId, familyId);
  }

  /**
   * Remove member from family
   * DELETE /api/v1/families/:id/members/:memberId
   */
  @Delete(':id/members/:memberId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @GetUser('id') userId: string,
    @Param('id') familyId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.familiesService.removeMember(userId, familyId, memberId);
  }

  /**
   * Leave family
   * POST /api/v1/families/:id/leave
   */
  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveFamily(@GetUser('id') userId: string, @Param('id') familyId: string) {
    return this.familiesService.leaveFamily(userId, familyId);
  }
}
