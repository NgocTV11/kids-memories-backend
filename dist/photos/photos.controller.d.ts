import { PhotosService } from './photos.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { TagKidsDto } from './dto/tag-kids.dto';
export declare class PhotosController {
    private readonly photosService;
    constructor(photosService: PhotosService);
    upload(file: Express.Multer.File, userId: string, albumId: string, uploadDto: UploadPhotoDto): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        user: {
            display_name: string;
            id: string;
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
    findAll(userId: string, userRole: string, albumId?: string, kidId?: string, limit?: string, offset?: string): Promise<{
        data: any[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findOne(userId: string, userRole: string, photoId: string): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        user: {
            display_name: string;
            id: string;
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
    update(userId: string, userRole: string, photoId: string, updateDto: UpdatePhotoDto): Promise<{
        likes_count: number;
        comments_count: number;
        _count: undefined;
        user: {
            display_name: string;
            id: string;
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
            display_name: string;
            id: string;
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
            display_name: string;
            id: string;
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
    trackView(userId: string, photoId: string): Promise<{
        message: string;
        view_count: number;
    }>;
}
