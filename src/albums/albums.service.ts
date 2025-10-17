import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { ShareAlbumDto } from './dto/share-album.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import {
  buildFamilyAccessWhere,
  checkFamilyAccess,
} from '../common/helpers/family-access.helper';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new album
   */
  async create(userId: string, createAlbumDto: CreateAlbumDto, userRole?: string) {
    // If kid_id provided, verify access (ownership or family)
    if (createAlbumDto.kid_id) {
      const familyWhere = await buildFamilyAccessWhere(
        this.prisma,
        userId,
        userRole,
      );

      const kid = await this.prisma.kids.findFirst({
        where: {
          id: createAlbumDto.kid_id,
          ...familyWhere,
        },
      });

      if (!kid) {
        throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
      }
    }

    // If family_id provided, check access
    if (createAlbumDto.family_id) {
      const hasAccess = await checkFamilyAccess(
        this.prisma,
        userId,
        createAlbumDto.family_id,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'Bạn không có quyền tạo album trong family này',
        );
      }
    }

    // Prepare data object
    const albumData: any = {
      title: createAlbumDto.title,
      description: createAlbumDto.description,
      privacy_level: createAlbumDto.privacy_level,
      cover_photo_url: createAlbumDto.cover_photo_url,
      tags: createAlbumDto.tags || [],
      user: {
        connect: {
          id: userId,
        },
      },
    };

    // Add family_id only if provided
    if (createAlbumDto.family_id) {
      albumData.family_id = createAlbumDto.family_id;
    }

    // Add kid relation only if provided
    if (createAlbumDto.kid_id) {
      albumData.kid = {
        connect: {
          id: createAlbumDto.kid_id,
        },
      };
    }

    const album = await this.prisma.albums.create({
      data: albumData,
      select: {
        id: true,
        title: true,
        description: true,
        kid_id: true,
        family_id: true,
        privacy_level: true,
        cover_photo_url: true,
        tags: true,
        created_at: true,
        kid: {
          select: {
            id: true,
            name: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return album;
  }

  /**
   * Get all albums for current user (includes family shared albums)
   */
  async findAll(userId: string, kidId?: string, userRole?: string) {
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const where: any = {
      ...familyWhere,
    };

    if (kidId) {
      where.kid_id = kidId;
    }

    const albums = await this.prisma.albums.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        kid_id: true,
        family_id: true,
        privacy_level: true,
        cover_photo_url: true,
        tags: true,
        created_at: true,
        kid: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          select: {
            id: true,
            thumbnail_url: true,
            is_deleted: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return albums.map((album) => {
      // Filter out deleted photos
      const activePhotos = album.photos.filter(p => !p.is_deleted);
      
      // Determine cover photo URL
      let coverPhotoUrl = album.cover_photo_url;
      
      // If cover_photo_url is a local path (starts with /uploads/), use first photo's thumbnail instead
      if (coverPhotoUrl && coverPhotoUrl.startsWith('/uploads/')) {
        coverPhotoUrl = activePhotos[0]?.thumbnail_url || null;
      }
      
      // If no cover_photo_url at all, use first photo's thumbnail
      if (!coverPhotoUrl) {
        coverPhotoUrl = activePhotos[0]?.thumbnail_url || null;
      }
      
      return {
        ...album,
        cover_photo_url: coverPhotoUrl,
        photos: undefined, // Remove photos array from response
        photos_count: activePhotos.length,
      };
    });
  }

  /**
   * Get one album by ID (with family access check)
   */
  async findOne(userId: string, albumId: string, userRole?: string) {
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        ...familyWhere,
      },
      select: {
        id: true,
        title: true,
        description: true,
        kid_id: true,
        family_id: true,
        privacy_level: true,
        cover_photo_url: true,
        tags: true,
        created_at: true,
        updated_at: true,
        kid: {
          select: {
            id: true,
            name: true,
            date_of_birth: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
    }

    // Fix cover_photo_url if it's a local path
    let coverPhotoUrl = album.cover_photo_url;
    if (coverPhotoUrl && coverPhotoUrl.startsWith('/uploads/')) {
      // Get first photo's thumbnail as fallback
      const firstPhoto = await this.prisma.photos.findFirst({
        where: {
          album_id: albumId,
          is_deleted: false,
        },
        select: {
          thumbnail_url: true,
        },
        orderBy: {
          created_at: 'asc',
        },
      });
      coverPhotoUrl = firstPhoto?.thumbnail_url || null;
    }

    return {
      ...album,
      cover_photo_url: coverPhotoUrl,
      photo_count: album._count.photos,
      _count: undefined,
    };
  }

  /**
   * Update album (with family access check)
   */
  async update(userId: string, albumId: string, updateAlbumDto: UpdateAlbumDto, userRole?: string) {
    // Check access (ownership or family membership)
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        ...familyWhere,
      },
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
    }

    // If kid_id is being updated, verify access
    if (updateAlbumDto.kid_id && updateAlbumDto.kid_id !== album.kid_id) {
      const kid = await this.prisma.kids.findFirst({
        where: {
          id: updateAlbumDto.kid_id,
          ...familyWhere,
        },
      });

      if (!kid) {
        throw new NotFoundException('Hồ sơ trẻ không tồn tại hoặc không có quyền truy cập');
      }
    }

    // If family_id is being changed, check new family access
    if (updateAlbumDto.family_id && updateAlbumDto.family_id !== album.family_id) {
      const hasAccess = await checkFamilyAccess(
        this.prisma,
        userId,
        updateAlbumDto.family_id,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'Bạn không có quyền chuyển album vào family này',
        );
      }
    }

    const updatedAlbum = await this.prisma.albums.update({
      where: { id: albumId },
      data: {
        title: updateAlbumDto.title,
        description: updateAlbumDto.description,
        kid_id: updateAlbumDto.kid_id,
        family_id: updateAlbumDto.family_id,
        privacy_level: updateAlbumDto.privacy_level,
        cover_photo_url: updateAlbumDto.cover_photo_url,
        tags: updateAlbumDto.tags,
        updated_at: new Date(),
      },
      select: {
        id: true,
        title: true,
        description: true,
        kid_id: true,
        family_id: true,
        privacy_level: true,
        cover_photo_url: true,
        tags: true,
        updated_at: true,
      },
    });

    return updatedAlbum;
  }

  /**
   * Delete album (CASCADE will delete related photos) - with family access check
   */
  async remove(userId: string, albumId: string, userRole?: string) {
    // Check access (ownership or family membership)
    const familyWhere = await buildFamilyAccessWhere(
      this.prisma,
      userId,
      userRole,
    );

    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        ...familyWhere,
      },
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
    }

    // Hard delete - CASCADE will handle related photos
    await this.prisma.albums.delete({
      where: { id: albumId },
    });

    return { message: 'Xóa album thành công' };
  }

  /**
   * Share album - Generate share token
   */
  async shareAlbum(userId: string, albumId: string, shareDto: ShareAlbumDto) {
    // Check ownership
    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        user: {
          id: userId,
        },
      },
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
    }

    // Generate unique share token
    const shareToken = randomBytes(32).toString('hex');

    // Hash password if provided
    const passwordHash = shareDto.password
      ? await bcrypt.hash(shareDto.password, 12)
      : null;

    // Check if share already exists
    const existingShare = await this.prisma.shares.findFirst({
      where: { album_id: albumId },
    });

    let share;
    if (existingShare) {
      // Update existing share
      share = await this.prisma.shares.update({
        where: { id: existingShare.id },
        data: {
          share_token: shareToken,
          password_hash: passwordHash,
          expires_at: shareDto.expires_at ? new Date(shareDto.expires_at) : null,
        },
        select: {
          share_token: true,
          expires_at: true,
          created_at: true,
        },
      });
    } else {
      // Create new share
      share = await this.prisma.shares.create({
        data: {
          album_id: albumId,
          shared_by: userId,
          share_token: shareToken,
          password_hash: passwordHash,
          expires_at: shareDto.expires_at ? new Date(shareDto.expires_at) : null,
        },
        select: {
          share_token: true,
          expires_at: true,
          created_at: true,
        },
      });
    }

    return {
      message: 'Tạo liên kết chia sẻ thành công',
      share_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${share.share_token}`,
      share_token: share.share_token,
      password_protected: !!passwordHash,
      expires_at: share.expires_at,
    };
  }

  /**
   * Get shared album by token (public access)
   */
  async getSharedAlbum(shareToken: string, password?: string) {
    const share = await this.prisma.shares.findUnique({
      where: { share_token: shareToken },
    });

    if (!share) {
      throw new NotFoundException('Liên kết chia sẻ không tồn tại');
    }

    // Check if expired
    if (share.expires_at && new Date() > share.expires_at) {
      throw new ForbiddenException('Liên kết chia sẻ đã hết hạn');
    }

    // Check password if protected
    if (share.password_hash) {
      if (!password) {
        throw new ForbiddenException('Album này yêu cầu mật khẩu');
      }

      const isPasswordValid = await bcrypt.compare(password, share.password_hash);
      if (!isPasswordValid) {
        throw new ForbiddenException('Mật khẩu không đúng');
      }
    }

    // Get album with photos
    const album = await this.prisma.albums.findUnique({
      where: { id: share.album_id },
      select: {
        id: true,
        title: true,
        description: true,
        cover_photo_url: true,
        tags: true,
        created_at: true,
        kid: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          select: {
            id: true,
            file_url: true,
            thumbnail_url: true,
            caption: true,
            date_taken: true,
            created_at: true,
          },
          where: { is_deleted: false },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại');
    }

    // Fix cover_photo_url if it's a local path
    let coverPhotoUrl = album.cover_photo_url;
    if (coverPhotoUrl && coverPhotoUrl.startsWith('/uploads/')) {
      coverPhotoUrl = album.photos[0]?.thumbnail_url || null;
    }
    if (!coverPhotoUrl) {
      coverPhotoUrl = album.photos[0]?.thumbnail_url || null;
    }

    return {
      ...album,
      cover_photo_url: coverPhotoUrl,
    };
  }

  /**
   * Remove share (stop sharing)
   */
  async removeShare(userId: string, albumId: string) {
    // Check ownership
    const album = await this.prisma.albums.findFirst({
      where: {
        id: albumId,
        user: {
          id: userId,
        },
      },
    });

    if (!album) {
      throw new NotFoundException('Album không tồn tại hoặc không có quyền truy cập');
    }

    // Delete share
    await this.prisma.shares.deleteMany({
      where: { album_id: albumId },
    });

    return { message: 'Đã ngừng chia sẻ album' };
  }
}
