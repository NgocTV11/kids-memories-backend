import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { ShareAlbumDto } from './dto/share-album.dto';
export declare class AlbumsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createAlbumDto: CreateAlbumDto, userRole?: string): Promise<{
        id: string;
        created_at: Date;
        family_id: string | null;
        family: {
            id: string;
            name: string;
        } | null;
        description: string | null;
        title: string;
        kid_id: string | null;
        privacy_level: string;
        cover_photo_url: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        kid: {
            id: string;
            name: string;
        } | null;
    }>;
    findAll(userId: string, kidId?: string, userRole?: string): Promise<{
        cover_photo_url: string | null;
        photos: undefined;
        photos_count: number;
        id: string;
        created_at: Date;
        family_id: string | null;
        description: string | null;
        title: string;
        kid_id: string | null;
        privacy_level: string;
        tags: import("@prisma/client/runtime/library").JsonValue;
        kid: {
            id: string;
            name: string;
        } | null;
    }[]>;
    findOne(userId: string, albumId: string, userRole?: string): Promise<{
        photo_count: number;
        _count: undefined;
        id: string;
        created_at: Date;
        updated_at: Date;
        family_id: string | null;
        family: {
            id: string;
            name: string;
        } | null;
        description: string | null;
        title: string;
        kid_id: string | null;
        privacy_level: string;
        cover_photo_url: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
        } | null;
    }>;
    update(userId: string, albumId: string, updateAlbumDto: UpdateAlbumDto, userRole?: string): Promise<{
        id: string;
        updated_at: Date;
        family_id: string | null;
        description: string | null;
        title: string;
        kid_id: string | null;
        privacy_level: string;
        cover_photo_url: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(userId: string, albumId: string, userRole?: string): Promise<{
        message: string;
    }>;
    shareAlbum(userId: string, albumId: string, shareDto: ShareAlbumDto): Promise<{
        message: string;
        share_url: string;
        share_token: any;
        password_protected: boolean;
        expires_at: any;
    }>;
    getSharedAlbum(shareToken: string, password?: string): Promise<{
        id: string;
        created_at: Date;
        photos: {
            id: string;
            created_at: Date;
            file_url: string;
            thumbnail_url: string | null;
            caption: string | null;
            date_taken: Date | null;
        }[];
        description: string | null;
        title: string;
        cover_photo_url: string | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        kid: {
            id: string;
            name: string;
        } | null;
    } | null>;
    removeShare(userId: string, albumId: string): Promise<{
        message: string;
    }>;
}
