import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(userId: string, createCommentDto: CreateCommentDto): Promise<{
        replies_count: number;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        user_id: string;
        photo_id: string;
        parent_comment_id: string | null;
        content: string;
    }>;
    findByPhoto(userId: string, photoId: string): Promise<{
        replies_count: number;
        replies: any;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        user_id: string;
        photo_id: string;
        parent_comment_id: string | null;
        content: string;
    }[]>;
    findOne(userId: string, commentId: string): Promise<{
        replies_count: number;
        replies: any;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        photo: {
            id: string;
            thumbnail_url: string | null;
            caption: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        user_id: string;
        photo_id: string;
        parent_comment_id: string | null;
        content: string;
    }>;
    update(userId: string, commentId: string, updateCommentDto: UpdateCommentDto): Promise<{
        replies_count: number;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        is_deleted: boolean;
        user_id: string;
        photo_id: string;
        parent_comment_id: string | null;
        content: string;
    }>;
    remove(userId: string, commentId: string): Promise<{
        message: string;
    }>;
}
