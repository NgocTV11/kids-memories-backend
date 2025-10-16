"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFamilyAccess = checkFamilyAccess;
exports.getUserFamilyIds = getUserFamilyIds;
exports.buildFamilyAccessWhere = buildFamilyAccessWhere;
async function checkFamilyAccess(prisma, userId, familyId) {
    if (!familyId) {
        return false;
    }
    const membership = await prisma.family_members.findFirst({
        where: {
            family_id: familyId,
            user_id: userId,
            status: 'active',
        },
    });
    return !!membership;
}
async function getUserFamilyIds(prisma, userId) {
    const memberships = await prisma.family_members.findMany({
        where: {
            user_id: userId,
            status: 'active',
        },
        select: {
            family_id: true,
        },
    });
    return memberships.map((m) => m.family_id);
}
async function buildFamilyAccessWhere(prisma, userId, userRole) {
    if (userRole === 'admin') {
        return {};
    }
    const familyIds = await getUserFamilyIds(prisma, userId);
    return {
        OR: [
            { created_by: userId },
            ...(familyIds.length > 0
                ? [{ family_id: { in: familyIds } }]
                : []),
        ],
    };
}
//# sourceMappingURL=family-access.helper.js.map