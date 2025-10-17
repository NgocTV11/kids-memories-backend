import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { AddGrowthDataDto } from './dto/add-growth-data.dto';
import {
  buildFamilyAccessWhere,
  checkFamilyAccess,
} from '../common/helpers/family-access.helper';

@Injectable()
export class KidsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new kid profile
   */
  async create(userId: string, createKidDto: CreateKidDto) {
    // If family_id is provided, check user has access to that family
    if (createKidDto.family_id) {
      const hasAccess = await checkFamilyAccess(
        this.prisma,
        userId,
        createKidDto.family_id,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'Bạn không có quyền thêm trẻ vào family này',
        );
      }
    }

    // Prepare data object
    const kidData: any = {
      name: createKidDto.name,
      date_of_birth: new Date(createKidDto.date_of_birth),
      gender: createKidDto.gender,
      bio: createKidDto.bio,
      profile_picture: createKidDto.profile_picture,
      user: {
        connect: {
          id: userId,
        },
      },
    };

    // Add family_id only if provided
    if (createKidDto.family_id) {
      kidData.family_id = createKidDto.family_id;
    }

    const kid = await this.prisma.kids.create({
      data: kidData,
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        gender: true,
        bio: true,
        profile_picture: true,
        growth_data: true,
        family_id: true,
        created_at: true,
      },
    });

    return kid;
  }

  /**
   * Get all kids for current user (includes family shared kids)
   */
  async findAll(userId: string, userRole?: string) {
    // Build where clause based on family access
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const kids = await this.prisma.kids.findMany({
      where: familyWhere,
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        gender: true,
        bio: true,
        profile_picture: true,
        growth_data: true,
        family_id: true,
        created_at: true,
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate age for each kid
    const kidsWithAge = kids.map((kid) => ({
      ...kid,
      age: this.calculateAge(kid.date_of_birth),
    }));

    return kidsWithAge;
  }

  /**
   * Get one kid by ID (includes family access check)
   */
  async findOne(userId: string, kidId: string, userRole?: string) {
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kidId,
        ...familyWhere,
      },
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        gender: true,
        bio: true,
        profile_picture: true,
        growth_data: true,
        family_id: true,
        created_at: true,
        updated_at: true,
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!kid) {
      throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
    }

    return {
      ...kid,
      age: this.calculateAge(kid.date_of_birth),
    };
  }

  /**
   * Update kid profile (with family access check)
   */
  async update(userId: string, kidId: string, updateKidDto: UpdateKidDto, userRole?: string) {
    // Check access (ownership or family membership)
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kidId,
        ...familyWhere,
      },
    });

    if (!kid) {
      throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
    }

    // If family_id is being changed, check new family access
    if (updateKidDto.family_id && updateKidDto.family_id !== kid.family_id) {
      const hasAccess = await checkFamilyAccess(
        this.prisma,
        userId,
        updateKidDto.family_id,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'Bạn không có quyền chuyển trẻ vào family này',
        );
      }
    }

    // Update
    const updatedKid = await this.prisma.kids.update({
      where: { id: kidId },
      data: {
        name: updateKidDto.name,
        date_of_birth: updateKidDto.date_of_birth
          ? new Date(updateKidDto.date_of_birth)
          : undefined,
        gender: updateKidDto.gender,
        bio: updateKidDto.bio,
        profile_picture: updateKidDto.profile_picture,
        family_id: updateKidDto.family_id,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        gender: true,
        bio: true,
        profile_picture: true,
        growth_data: true,
        family_id: true,
        updated_at: true,
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      ...updatedKid,
      age: this.calculateAge(updatedKid.date_of_birth),
    };
  }

  /**
   * Hard delete kid profile (CASCADE will delete related albums/photos)
   */
  async remove(userId: string, kidId: string, userRole?: string) {
    // Check ownership (admin can delete any kid)
    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kidId,
        ...(userRole !== 'admin' && {
          user: {
            id: userId,
          },
        }),
      },
    });

    if (!kid) {
      throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
    }

    // Hard delete - CASCADE will handle related data
    await this.prisma.kids.delete({
      where: { id: kidId },
    });

    return { message: 'Xóa hồ sơ trẻ thành công' };
  }

  /**
   * Add growth data (height, weight)
   */
  async addGrowthData(
    userId: string,
    kidId: string,
    growthDataDto: AddGrowthDataDto,
    userRole?: string,
  ) {
    // Check access (ownership, family membership, or admin)
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kidId,
        ...familyWhere,
      },
    });

    if (!kid) {
      throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
    }

    // Get current growth_data
    const currentGrowthData = (kid.growth_data as any[]) || [];

    // Add new entry
    const newEntry = {
      date: growthDataDto.date,
      height: growthDataDto.height,
      weight: growthDataDto.weight,
      note: growthDataDto.note,
    };

    const updatedGrowthData = [...currentGrowthData, newEntry];

    // Sort by date (newest first)
    updatedGrowthData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Update kid with new growth data
    const updatedKid = await this.prisma.kids.update({
      where: { id: kidId },
      data: {
        growth_data: updatedGrowthData,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        growth_data: true,
      },
    });

    return {
      message: 'Thêm dữ liệu tăng trưởng thành công',
      kid: updatedKid,
    };
  }

  /**
   * Get growth history for a kid
   */
  async getGrowthHistory(userId: string, kidId: string, userRole?: string) {
    // Check access (ownership, family membership, or admin)
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const kid = await this.prisma.kids.findFirst({
      where: {
        id: kidId,
        ...familyWhere,
      },
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        growth_data: true,
      },
    });

    if (!kid) {
      throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
    }

    const growthData = (kid.growth_data as any[]) || [];

    return {
      kid_id: kid.id,
      kid_name: kid.name,
      age: this.calculateAge(kid.date_of_birth),
      growth_history: growthData,
      total_entries: growthData.length,
    };
  }

  /**
   * Helper: Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): string {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return `${years} tuổi ${months} tháng`;
    } else {
      return `${months} tháng`;
    }
  }
}
