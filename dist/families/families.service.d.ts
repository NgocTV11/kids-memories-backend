import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
export declare class FamiliesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createFamilyDto: CreateFamilyDto): Promise<{
        owner: {
            email: string;
            display_name: string;
            id: string;
            avatar_url: string | null;
        };
        members: ({
            user: {
                email: string;
                display_name: string;
                id: string;
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
            email: string;
            display_name: string;
            id: string;
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
    findOne(userId: string, familyId: string): Promise<{
        owner: {
            email: string;
            display_name: string;
            id: string;
            avatar_url: string | null;
        };
        members: ({
            user: {
                email: string;
                display_name: string;
                id: string;
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
            email: string;
            display_name: string;
            id: string;
            avatar_url: string | null;
        };
        members: ({
            user: {
                email: string;
                display_name: string;
                id: string;
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
            email: string;
            display_name: string;
            id: string;
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
                email: string;
                display_name: string;
                id: string;
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
    getMyInvitations(userId: string): Promise<({
        family: {
            _count: {
                members: number;
            };
            owner: {
                email: string;
                display_name: string;
                id: string;
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
}
