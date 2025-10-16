import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
export declare class FamiliesController {
    private readonly familiesService;
    constructor(familiesService: FamiliesService);
    create(userId: string, createFamilyDto: CreateFamilyDto): Promise<{
        owner: {
            id: string;
            email: string;
            display_name: string;
            avatar_url: string | null;
        };
        members: ({
            user: {
                id: string;
                email: string;
                display_name: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            role: string;
            family_id: string;
            user_id: string;
            status: string;
            joined_at: Date;
        })[];
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
    }>;
    findAll(userId: string): Promise<({
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
    })[]>;
    getMyInvitations(userId: string): Promise<({
        family: {
            _count: {
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
        };
    } & {
        id: string;
        role: string;
        family_id: string;
        user_id: string;
        status: string;
        joined_at: Date;
    })[]>;
    findOne(userId: string, familyId: string): Promise<{
        owner: {
            id: string;
            email: string;
            display_name: string;
            avatar_url: string | null;
        };
        members: ({
            user: {
                id: string;
                email: string;
                display_name: string;
                avatar_url: string | null;
                role: string;
            };
        } & {
            id: string;
            role: string;
            family_id: string;
            user_id: string;
            status: string;
            joined_at: Date;
        })[];
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
    }>;
    update(userId: string, familyId: string, updateFamilyDto: UpdateFamilyDto): Promise<{
        owner: {
            id: string;
            email: string;
            display_name: string;
            avatar_url: string | null;
        };
        members: ({
            user: {
                id: string;
                email: string;
                display_name: string;
                avatar_url: string | null;
            };
        } & {
            id: string;
            role: string;
            family_id: string;
            user_id: string;
            status: string;
            joined_at: Date;
        })[];
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
    }>;
    remove(userId: string, familyId: string): Promise<{
        message: string;
    }>;
    inviteMember(userId: string, familyId: string, inviteMemberDto: InviteMemberDto): Promise<{
        user: {
            id: string;
            email: string;
            display_name: string;
            avatar_url: string | null;
        };
    } & {
        id: string;
        role: string;
        family_id: string;
        user_id: string;
        status: string;
        joined_at: Date;
    }>;
    acceptInvitation(userId: string, familyId: string): Promise<{
        family: {
            owner: {
                id: string;
                email: string;
                display_name: string;
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
        };
    } & {
        id: string;
        role: string;
        family_id: string;
        user_id: string;
        status: string;
        joined_at: Date;
    }>;
    removeMember(userId: string, familyId: string, memberId: string): Promise<{
        message: string;
    }>;
    leaveFamily(userId: string, familyId: string): Promise<{
        message: string;
    }>;
}
