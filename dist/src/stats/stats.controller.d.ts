import { PrismaService } from '../prisma/prisma.service';
export declare class StatsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(userId: string, userRole: string): Promise<{
        kids: number;
        albums: number;
        photos: number;
        milestones: number;
        families: number;
    }>;
}
