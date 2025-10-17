import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KidsService } from './kids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { AddGrowthDataDto } from './dto/add-growth-data.dto';

@Controller('kids')
@UseGuards(JwtAuthGuard)
export class KidsController {
  constructor(private readonly kidsService: KidsService) {}

  /**
   * Create a new kid profile
   * POST /api/v1/kids
   */
  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() createKidDto: CreateKidDto,
  ) {
    return this.kidsService.create(userId, createKidDto);
  }

  /**
   * Get all kids for current user
   * GET /api/v1/kids
   */
  @Get()
  async findAll(@GetUser('id') userId: string, @GetUser('role') userRole: string) {
    return this.kidsService.findAll(userId, userRole);
  }

  /**
   * Get one kid by ID
   * GET /api/v1/kids/:id
   */
  @Get(':id')
  async findOne(@GetUser('id') userId: string, @Param('id') kidId: string, @GetUser('role') userRole: string) {
    return this.kidsService.findOne(userId, kidId, userRole);
  }

  /**
   * Update kid profile
   * PUT /api/v1/kids/:id
   */
  @Put(':id')
  async update(
    @GetUser('id') userId: string,
    @Param('id') kidId: string,
    @Body() updateKidDto: UpdateKidDto,
    @GetUser('role') userRole: string,
  ) {
    return this.kidsService.update(userId, kidId, updateKidDto, userRole);
  }

  /**
   * Delete kid profile (soft delete)
   * DELETE /api/v1/kids/:id
   */
  @Delete(':id')
  async remove(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') kidId: string,
  ) {
    return this.kidsService.remove(userId, kidId, userRole);
  }

  /**
   * Add growth data (height, weight)
   * POST /api/v1/kids/:id/growth
   */
  @Post(':id/growth')
  async addGrowthData(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') kidId: string,
    @Body() growthDataDto: AddGrowthDataDto,
  ) {
    return this.kidsService.addGrowthData(userId, kidId, growthDataDto, userRole);
  }

  /**
   * Get growth history for a kid
   * GET /api/v1/kids/:id/growth
   */
  @Get(':id/growth')
  async getGrowthHistory(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') kidId: string,
  ) {
    return this.kidsService.getGrowthHistory(userId, kidId, userRole);
  }

  /**
   * Upload avatar for a kid
   * POST /api/v1/kids/:id/avatar
   */
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id') kidId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.kidsService.uploadAvatar(userId, kidId, avatar, userRole);
  }
}
