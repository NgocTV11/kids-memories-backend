import { PrismaService } from '../../prisma/prisma.service';
export declare function checkFamilyAccess(prisma: PrismaService, userId: string, familyId: string | null): Promise<boolean>;
export declare function getUserFamilyIds(prisma: PrismaService, userId: string): Promise<string[]>;
export declare function buildFamilyAccessWhere(prisma: PrismaService, userId: string, userRole?: string): Promise<{
    OR?: undefined;
} | {
    OR: ({
        created_by: string;
        family_id?: undefined;
    } | {
        family_id: {
            in: string[];
        };
        created_by?: undefined;
    })[];
}>;
