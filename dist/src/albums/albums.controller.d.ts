import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { ShareAlbumDto } from './dto/share-album.dto';
export declare class AlbumsController {
    private readonly albumsService;
    constructor(albumsService: AlbumsService);
    create(userId: string, userRole: string, createAlbumDto: CreateAlbumDto): Promise<{
        id: string;
        created_at: Date;
        tags: import("@prisma/client/runtime/library").JsonValue;
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
        kid: {
            id: string;
            name: string;
        } | null;
    }>;
    findAll(userId: string, userRole: string, kidId?: string): Promise<{
        cover_photo_url: string | null;
        photos: undefined;
        photos_count: number;
        id: string;
        created_at: Date;
        tags: import("@prisma/client/runtime/library").JsonValue;
        family_id: string | null;
        description: string | null;
        title: string;
        kid_id: string | null;
        privacy_level: string;
        kid: {
            id: string;
            name: string;
        } | null;
    }[]>;
    findOne(userId: string, userRole: string, albumId: string): Promise<{
        photo_count: number;
        _count: undefined;
        id: string;
        created_at: Date;
        updated_at: Date;
        tags: import("@prisma/client/runtime/library").JsonValue;
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
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
        } | null;
    }>;
    update(userId: string, userRole: string, albumId: string, updateAlbumDto: UpdateAlbumDto): Promise<{
        id: string;
        updated_at: Date;
        tags: import("@prisma/client/runtime/library").JsonValue;
        family_id: string | null;
        description: string | null;
        title: string;
        kid_id: string | null;
        privacy_level: string;
        cover_photo_url: string | null;
    }>;
    remove(userId: string, userRole: string, albumId: string): Promise<{
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
        tags: import("@prisma/client/runtime/library").JsonValue;
        description: string | null;
        title: string;
        cover_photo_url: string | null;
        kid: {
            id: string;
            name: string;
        } | null;
    } | null>;
    removeShare(userId: string, albumId: string): Promise<{
        message: string;
    }>;
}
