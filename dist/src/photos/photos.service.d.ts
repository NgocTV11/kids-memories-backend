import { PrismaService } from '../prisma/prisma.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { TagKidsDto } from './dto/tag-kids.dto';
export declare class PhotosService {
    private prisma;
    private imageProcessor;
    constructor(prisma: PrismaService);
    upload(file: Express.Multer.File, userId: string, albumId: string, uploadDto: UploadPhotoDto): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        album: {
            id: string;
            title: string;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        deleted_at: Date | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        album_id: string;
        uploaded_by: string;
        file_url: string;
        thumbnail_url: string | null;
        medium_url: string | null;
        caption: string | null;
        date_taken: Date | null;
        exif_data: import("@prisma/client/runtime/library").JsonValue;
        kids_tagged: import("@prisma/client/runtime/library").JsonValue;
        view_count: number;
    }>;
    findAll(userId: string, albumId?: string, kidId?: string, limit?: number, offset?: number, userRole?: string): Promise<{
        data: any[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findOne(userId: string, photoId: string, userRole?: string): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        album: {
            id: string;
            title: string;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        deleted_at: Date | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        album_id: string;
        uploaded_by: string;
        file_url: string;
        thumbnail_url: string | null;
        medium_url: string | null;
        caption: string | null;
        date_taken: Date | null;
        exif_data: import("@prisma/client/runtime/library").JsonValue;
        kids_tagged: import("@prisma/client/runtime/library").JsonValue;
        view_count: number;
    }>;
    update(userId: string, photoId: string, updateDto: UpdatePhotoDto): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        album: {
            id: string;
            title: string;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        deleted_at: Date | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        album_id: string;
        uploaded_by: string;
        file_url: string;
        thumbnail_url: string | null;
        medium_url: string | null;
        caption: string | null;
        date_taken: Date | null;
        exif_data: import("@prisma/client/runtime/library").JsonValue;
        kids_tagged: import("@prisma/client/runtime/library").JsonValue;
        view_count: number;
    }>;
    remove(userId: string, photoId: string): Promise<{
        message: string;
    }>;
    tagKids(userId: string, photoId: string, tagKidsDto: TagKidsDto): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        album: {
            id: string;
            title: string;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        deleted_at: Date | null;
        tags: import("@prisma/client/runtime/library").JsonValue;
        album_id: string;
        uploaded_by: string;
        file_url: string;
        thumbnail_url: string | null;
        medium_url: string | null;
        caption: string | null;
        date_taken: Date | null;
        exif_data: import("@prisma/client/runtime/library").JsonValue;
        kids_tagged: import("@prisma/client/runtime/library").JsonValue;
        view_count: number;
    }>;
    like(userId: string, photoId: string): Promise<{
        message: string;
        liked: boolean;
    }>;
    unlike(userId: string, photoId: string): Promise<{
        message: string;
        liked: boolean;
    }>;
    checkIfLiked(userId: string, photoId: string): Promise<{
        isLiked: boolean;
    }>;
    getComments(userId: string, photoId: string): Promise<({
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        user_id: string;
        photo_id: string;
        parent_comment_id: string | null;
        content: string;
    })[]>;
    addComment(userId: string, photoId: string, content: string): Promise<{
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        user_id: string;
        photo_id: string;
        parent_comment_id: string | null;
        content: string;
    }>;
    trackView(photoId: string): Promise<{
        message: string;
        view_count: number;
    }>;
    private validateKidsAccess;
}
