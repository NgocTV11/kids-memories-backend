import { PrismaService } from '../../prisma/prisma.service';

/**
 * Helper to check if user has access to a resource through family membership
 */
export async function checkFamilyAccess(
  prisma: PrismaService,
  userId: string,
  familyId: string | null,
): Promise<boolean> {
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

/**
 * Helper to get all family IDs that user belongs to
 */
export async function getUserFamilyIds(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
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

/**
 * Build WHERE clause for resources that support family sharing
 * Returns condition: owned by user OR in user's families
 */
export async function buildFamilyAccessWhere(
  prisma: PrismaService,
  userId: string,
  userRole?: string,
) {
  // Admin can see everything
  if (userRole === 'admin') {
    return {};
  }

  const familyIds = await getUserFamilyIds(prisma, userId);

  return {
    OR: [
      { created_by: userId }, // Own resources
      ...(familyIds.length > 0
        ? [{ family_id: { in: familyIds } }] // Family resources
        : []),
    ],
  };
}
