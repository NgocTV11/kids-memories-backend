import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class FamiliesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new family
   */
  async create(userId: string, createFamilyDto: CreateFamilyDto) {
    // Create family with owner
    const family = await this.prisma.families.create({
      data: {
        name: createFamilyDto.name,
        description: createFamilyDto.description,
        avatar_url: createFamilyDto.avatar_url,
        owner_id: userId,
        members: {
          create: {
            user_id: userId,
            role: 'owner',
            status: 'active',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            display_name: true,
            email: true,
            avatar_url: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    return family;
  }

  /**
   * Get all families for user (owned or member of)
   */
  async findAll(userId: string) {
    const families = await this.prisma.families.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                user_id: userId,
                status: 'active',
              },
            },
          },
        ],
        is_deleted: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            display_name: true,
            email: true,
            avatar_url: true,
          },
        },
        _count: {
          select: {
            members: true,
            kids: true,
            albums: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return families;
  }

  /**
   * Get one family by ID
   */
  async findOne(userId: string, familyId: string) {
    const family = await this.prisma.families.findFirst({
      where: {
        id: familyId,
        OR: [
          { owner_id: userId },
          {
            members: {
              some: {
                user_id: userId,
                status: 'active',
              },
            },
          },
        ],
        is_deleted: false,
      },
      include: {
        owner: {
          select: {
            id: true,
            display_name: true,
            email: true,
            avatar_url: true,
          },
        },
        members: {
          where: {
            status: 'active',
          },
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                email: true,
                avatar_url: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family không tồn tại hoặc không có quyền truy cập');
    }

    return family;
  }

  /**
   * Update family
   */
  async update(userId: string, familyId: string, updateFamilyDto: UpdateFamilyDto) {
    // Check ownership or admin role
    const family = await this.prisma.families.findFirst({
      where: {
        id: familyId,
        is_deleted: false,
      },
      include: {
        members: {
          where: {
            user_id: userId,
            status: 'active',
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family không tồn tại');
    }

    const member = family.members[0];
    if (family.owner_id !== userId && member?.role !== 'admin') {
      throw new ForbiddenException('Chỉ owner hoặc admin mới có thể chỉnh sửa family');
    }

    const updated = await this.prisma.families.update({
      where: { id: familyId },
      data: updateFamilyDto,
      include: {
        owner: {
          select: {
            id: true,
            display_name: true,
            email: true,
            avatar_url: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete family (soft delete)
   */
  async remove(userId: string, familyId: string) {
    const family = await this.prisma.families.findFirst({
      where: {
        id: familyId,
        owner_id: userId,
        is_deleted: false,
      },
    });

    if (!family) {
      throw new NotFoundException('Family không tồn tại hoặc bạn không phải owner');
    }

    await this.prisma.families.update({
      where: { id: familyId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    return { message: 'Đã xóa family thành công' };
  }

  /**
   * Invite member to family
   */
  async inviteMember(userId: string, familyId: string, inviteMemberDto: InviteMemberDto) {
    // Check if user is owner or admin
    const family = await this.prisma.families.findFirst({
      where: {
        id: familyId,
        is_deleted: false,
      },
      include: {
        members: {
          where: {
            user_id: userId,
            status: 'active',
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family không tồn tại');
    }

    const member = family.members[0];
    if (family.owner_id !== userId && member?.role !== 'admin') {
      throw new ForbiddenException('Chỉ owner hoặc admin mới có thể mời thành viên');
    }

    // Check if user exists
    const targetUser = await this.prisma.users.findUnique({
      where: { id: inviteMemberDto.user_id },
    });

    if (!targetUser) {
      throw new NotFoundException('User không tồn tại');
    }

    // Check if already member
    const existingMember = await this.prisma.family_members.findUnique({
      where: {
        family_id_user_id: {
          family_id: familyId,
          user_id: inviteMemberDto.user_id,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new BadRequestException('User đã là thành viên của family');
      }
      // Update existing invitation
      const updated = await this.prisma.family_members.update({
        where: { id: existingMember.id },
        data: {
          role: inviteMemberDto.role,
          status: 'pending',
        },
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      });
      return updated;
    }

    // Create new invitation
    const newMember = await this.prisma.family_members.create({
      data: {
        family_id: familyId,
        user_id: inviteMemberDto.user_id,
        role: inviteMemberDto.role,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    return newMember;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(userId: string, familyId: string) {
    const invitation = await this.prisma.family_members.findUnique({
      where: {
        family_id_user_id: {
          family_id: familyId,
          user_id: userId,
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Lời mời không tồn tại');
    }

    if (invitation.status === 'active') {
      throw new BadRequestException('Bạn đã là thành viên của family');
    }

    const updated = await this.prisma.family_members.update({
      where: { id: invitation.id },
      data: { status: 'active' },
      include: {
        family: {
          include: {
            owner: {
              select: {
                id: true,
                display_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  /**
   * Remove member from family
   */
  async removeMember(userId: string, familyId: string, memberId: string) {
    // Check if user is owner or admin
    const family = await this.prisma.families.findFirst({
      where: {
        id: familyId,
        is_deleted: false,
      },
      include: {
        members: {
          where: {
            user_id: userId,
            status: 'active',
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundException('Family không tồn tại');
    }

    const requestingMember = family.members[0];
    if (family.owner_id !== userId && requestingMember?.role !== 'admin') {
      throw new ForbiddenException('Chỉ owner hoặc admin mới có thể xóa thành viên');
    }

    // Cannot remove owner
    if (memberId === family.owner_id) {
      throw new BadRequestException('Không thể xóa owner khỏi family');
    }

    await this.prisma.family_members.deleteMany({
      where: {
        family_id: familyId,
        user_id: memberId,
      },
    });

    return { message: 'Đã xóa thành viên khỏi family' };
  }

  /**
   * Leave family
   */
  async leaveFamily(userId: string, familyId: string) {
    const family = await this.prisma.families.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new NotFoundException('Family không tồn tại');
    }

    if (family.owner_id === userId) {
      throw new BadRequestException('Owner không thể rời family. Hãy chuyển quyền owner hoặc xóa family');
    }

    await this.prisma.family_members.deleteMany({
      where: {
        family_id: familyId,
        user_id: userId,
      },
    });

    return { message: 'Đã rời family thành công' };
  }

  /**
   * Get pending invitations for user
   */
  async getMyInvitations(userId: string) {
    const invitations = await this.prisma.family_members.findMany({
      where: {
        user_id: userId,
        status: 'pending',
      },
      include: {
        family: {
          include: {
            owner: {
              select: {
                id: true,
                display_name: true,
                email: true,
                avatar_url: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    return invitations;
  }
}
