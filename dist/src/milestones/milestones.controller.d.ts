import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AttachPhotosDto } from './dto/attach-photos.dto';
export declare class MilestonesController {
    private readonly milestonesService;
    constructor(milestonesService: MilestonesService);
    create(userId: string, userRole: string, createMilestoneDto: CreateMilestoneDto): Promise<{
        photos: {
            id: string;
            file_url: string;
            thumbnail_url: string | null;
            medium_url: string | null;
            caption: string | null;
            date_taken: Date | null;
        }[];
        milestone_photos: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
            profile_picture: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by: string;
        description: string | null;
        title: string;
        kid_id: string;
        milestone_date: Date;
        category: string;
    }>;
    findAll(userId: string, userRole: string, kidId?: string): Promise<{
        photos_count: number;
        _count: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        kid: {
            id: string;
            name: string;
            profile_picture: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by: string;
        description: string | null;
        title: string;
        kid_id: string;
        milestone_date: Date;
        category: string;
    }[]>;
    findOne(userId: string, userRole: string, milestoneId: string): Promise<{
        photos: {
            id: string;
            file_url: string;
            thumbnail_url: string | null;
            medium_url: string | null;
            caption: string | null;
            date_taken: Date | null;
        }[];
        milestone_photos: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
            profile_picture: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by: string;
        description: string | null;
        title: string;
        kid_id: string;
        milestone_date: Date;
        category: string;
    }>;
    update(userId: string, userRole: string, milestoneId: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
        photos: {
            id: string;
            file_url: string;
            thumbnail_url: string | null;
            medium_url: string | null;
            caption: string | null;
            date_taken: Date | null;
        }[];
        milestone_photos: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
            profile_picture: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by: string;
        description: string | null;
        title: string;
        kid_id: string;
        milestone_date: Date;
        category: string;
    }>;
    remove(userId: string, milestoneId: string): Promise<{
        message: string;
    }>;
    attachPhotos(userId: string, milestoneId: string, attachPhotosDto: AttachPhotosDto): Promise<{
        photos: {
            id: string;
            file_url: string;
            thumbnail_url: string | null;
            medium_url: string | null;
            caption: string | null;
            date_taken: Date | null;
        }[];
        milestone_photos: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
            profile_picture: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by: string;
        description: string | null;
        title: string;
        kid_id: string;
        milestone_date: Date;
        category: string;
    }>;
    detachPhotos(userId: string, milestoneId: string, attachPhotosDto: AttachPhotosDto): Promise<{
        photos: {
            id: string;
            file_url: string;
            thumbnail_url: string | null;
            medium_url: string | null;
            caption: string | null;
            date_taken: Date | null;
        }[];
        milestone_photos: undefined;
        user: {
            id: string;
            display_name: string;
            avatar_url: string | null;
        };
        kid: {
            id: string;
            name: string;
            date_of_birth: Date;
            profile_picture: string | null;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by: string;
        description: string | null;
        title: string;
        kid_id: string;
        milestone_date: Date;
        category: string;
    }>;
}
