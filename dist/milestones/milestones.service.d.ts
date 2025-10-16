import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AttachPhotosDto } from './dto/attach-photos.dto';
export declare class MilestonesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createMilestoneDto: CreateMilestoneDto, userRole?: string): Promise<{
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
            display_name: string;
            id: string;
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
    findAll(userId: string, kidId?: string, userRole?: string): Promise<{
        photos_count: number;
        _count: undefined;
        user: {
            display_name: string;
            id: string;
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
    findOne(userId: string, milestoneId: string, userRole?: string): Promise<{
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
            display_name: string;
            id: string;
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
    update(userId: string, milestoneId: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
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
            display_name: string;
            id: string;
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
            display_name: string;
            id: string;
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
            display_name: string;
            id: string;
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
    private attachPhotosToMilestone;
}
