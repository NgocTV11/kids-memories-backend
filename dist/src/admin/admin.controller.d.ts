import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalFamilies: number;
        totalKids: number;
        totalAlbums: number;
        totalPhotos: number;
        totalMilestones: number;
        recentUsers: {
            id: string;
            email: string;
            display_name: string;
            avatar_url: string | null;
            created_at: Date;
        }[];
    }>;
    getAllUsers(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string;
            display_name: string;
            avatar_url: string | null;
            role: string;
            created_at: Date;
            last_login: Date | null;
            _count: {
                kids: number;
                albums: number;
                photos: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateUserRole(userId: string, role: string): Promise<{
        id: string;
        email: string;
        display_name: string;
        role: string;
    }>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
    getAllFamilies(page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                kids: number;
                albums: number;
                members: number;
            };
            owner: {
                id: string;
                email: string;
                display_name: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            avatar_url: string | null;
            created_at: Date;
            updated_at: Date;
            is_deleted: boolean;
            deleted_at: Date | null;
            name: string;
            description: string | null;
            owner_id: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
