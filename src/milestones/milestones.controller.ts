import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AttachPhotosDto } from './dto/attach-photos.dto';

@Controller('milestones')
@UseGuards(JwtAuthGuard)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  /**
   * Create a new milestone
   * POST /milestones
   */
  @Post()
  async create(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(userId, createMilestoneDto, userRole);
  }

  /**
   * Get all milestones (optional kid filter)
   * GET /milestones?kid_id=xxx
   */
  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Query('kid_id') kidId?: string,
  ) {
    return this.milestonesService.findAll(userId, kidId, userRole);
  }

  /**
   * Get a single milestone with photos
   * GET /milestones/:id
   */
  @Get(':id')
  async findOne(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.milestonesService.findOne(userId, milestoneId, userRole);
  }

  /**
   * Update a milestone
   * PUT /milestones/:id
   */
  @Put(':id')
  async update(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('id', ParseUUIDPipe) milestoneId: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.update(userId, milestoneId, updateMilestoneDto);
  }

  /**
   * Delete a milestone
   * DELETE /milestones/:id
   */
  @Delete(':id')
  async remove(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.milestonesService.remove(userId, milestoneId);
  }

  /**
   * Attach photos to a milestone
   * POST /milestones/:id/photos
   */
  @Post(':id/photos')
  async attachPhotos(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) milestoneId: string,
    @Body() attachPhotosDto: AttachPhotosDto,
  ) {
    return this.milestonesService.attachPhotos(userId, milestoneId, attachPhotosDto);
  }

  /**
   * Remove photos from a milestone
   * DELETE /milestones/:id/photos
   */
  @Delete(':id/photos')
  async detachPhotos(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) milestoneId: string,
    @Body() attachPhotosDto: AttachPhotosDto,
  ) {
    return this.milestonesService.detachPhotos(userId, milestoneId, attachPhotosDto);
  }
}
