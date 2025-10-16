import { PrismaService } from '../prisma/prisma.service';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { AddGrowthDataDto } from './dto/add-growth-data.dto';
export declare class KidsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createKidDto: CreateKidDto): Promise<{
        id: string;
        created_at: Date;
        name: string;
        date_of_birth: Date;
        gender: string;
        bio: string | null;
        profile_picture: string | null;
        family_id: string | null;
        growth_data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(userId: string, userRole?: string): Promise<{
        age: string;
        id: string;
        created_at: Date;
        name: string;
        date_of_birth: Date;
        gender: string;
        bio: string | null;
        profile_picture: string | null;
        family_id: string | null;
        family: {
            id: string;
            name: string;
        } | null;
        growth_data: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(userId: string, kidId: string, userRole?: string): Promise<{
        age: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        date_of_birth: Date;
        gender: string;
        bio: string | null;
        profile_picture: string | null;
        family_id: string | null;
        family: {
            id: string;
            name: string;
        } | null;
        growth_data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(userId: string, kidId: string, updateKidDto: UpdateKidDto, userRole?: string): Promise<{
        age: string;
        id: string;
        updated_at: Date;
        name: string;
        date_of_birth: Date;
        gender: string;
        bio: string | null;
        profile_picture: string | null;
        family_id: string | null;
        family: {
            id: string;
            name: string;
        } | null;
        growth_data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(userId: string, kidId: string): Promise<{
        message: string;
    }>;
    addGrowthData(userId: string, kidId: string, growthDataDto: AddGrowthDataDto): Promise<{
        message: string;
        kid: {
            id: string;
            name: string;
            growth_data: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    getGrowthHistory(userId: string, kidId: string): Promise<{
        kid_id: string;
        kid_name: string;
        age: string;
        growth_history: any[];
        total_entries: number;
    }>;
    private calculateAge;
}
