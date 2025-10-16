# Phase 2: Update Existing Services to Support Family Sharing

## Services cần update:

### 1. KidsService (src/kids/kids.service.ts)

**Các method cần sửa:**

#### `findAll(userId: string)` 
- **Hiện tại**: Chỉ trả về kids của user
- **Cần sửa**: Trả về kids của user + kids trong families mà user là member
- **Code mẫu**:
```typescript
async findAll(userId: string, userRole: string) {
  const familyWhere = await buildFamilyAccessWhere(this.prisma, userId, userRole);
  
  const kids = await this.prisma.kids.findMany({
    where: familyWhere,
    include: {
      user: {
        select: {
          id: true,
          display_name: true,
          email: true,
        },
      },
      family: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return kids;
}
```

#### `create(userId: string, dto: CreateKidDto)`
- **Thêm field**: `family_id` vào DTO (optional)
- **Logic**: Khi tạo kid, cho phép assign vào family nếu user là member

#### `update(userId: string, kidId: string, dto: UpdateKidDto)`
- **Check quyền**: User phải là creator HOẶC member của family chứa kid
- **Code check**:
```typescript
const kid = await this.prisma.kids.findFirst({
  where: { id: kidId },
  include: { family: true },
});

if (!kid) throw new NotFoundException();

// Check if user owns OR is family member
if (kid.created_by !== userId) {
  if (!kid.family_id || !(await checkFamilyAccess(this.prisma, userId, kid.family_id))) {
    throw new ForbiddenException('Bạn không có quyền chỉnh sửa kid này');
  }
}
```

---

### 2. AlbumsService (src/albums/albums.service.ts)

**Method `findAll(userId: string, kidId?: string)`**
- Tương tự Kids, thêm family access check
- Code mẫu:
```typescript
async findAll(userId: string, userRole: string, kidId?: string) {
  const familyWhere = await buildFamilyAccessWhere(this.prisma, userId, userRole);

  const where: any = {
    ...familyWhere,
    is_deleted: false,
  };

  if (kidId) {
    where.kid_id = kidId;
  }

  const albums = await this.prisma.albums.findMany({
    where,
    include: {
      kid: true,
      family: {
        select: {
          id: true,
          name: true,
        },
      },
      // ... rest of includes
    },
  });

  return albums;
}
```

**Method `create()`, `update()`, `delete()`**
- Thêm `family_id` support
- Check family membership khi edit/delete

---

### 3. PhotosService (src/photos/photos.service.ts)

**Method `findAll()`**
- Photos qua albums, nên check album's family_id
- Code:
```typescript
async findAll(userId: string, userRole: string, albumId?: string, kidId?: string, limit?: number, offset?: number) {
  // Build family access for albums
  const familyWhere = await buildFamilyAccessWhere(this.prisma, userId, userRole);

  const where: any = {
    is_deleted: false,
    album: {
      ...familyWhere,
      is_deleted: false,
    },
  };

  if (albumId) where.album_id = albumId;
  if (kidId) where.kids_tagged = { has: kidId };

  // ... rest of logic
}
```

---

### 4. MilestonesService (src/milestones/milestones.service.ts)

**Method `findAll()`**
- Check qua kid's family_id
- Code:
```typescript
async findAll(userId: string, userRole: string, kidId?: string) {
  const familyWhere = await buildFamilyAccessWhere(this.prisma, userId, userRole);

  const where: any = {
    kid: familyWhere,
  };

  if (kidId) where.kid_id = kidId;

  const milestones = await this.prisma.milestones.findMany({
    where,
    include: {
      kid: {
        include: {
          family: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      // ... rest
    },
  });

  return milestones;
}
```

---

### 5. StatsService (src/stats/stats.controller.ts)

**Method `getStats()`**
- Thêm stats cho families
- Đếm kids/albums/photos trong families mà user là member
- Code:
```typescript
@Get()
async getStats(@GetUser('id') userId: string, @GetUser() user: any) {
  const familyIds = await getUserFamilyIds(this.prisma, userId);

  const [kidsCount, albumsCount, photosCount, milestonesCount, familiesCount] = await Promise.all([
    this.prisma.kids.count({
      where: {
        OR: [
          { created_by: userId },
          ...(familyIds.length > 0 ? [{ family_id: { in: familyIds } }] : []),
        ],
      },
    }),
    this.prisma.albums.count({
      where: {
        OR: [
          { created_by: userId, is_deleted: false },
          ...(familyIds.length > 0 ? [{ family_id: { in: familyIds }, is_deleted: false }] : []),
        ],
      },
    }),
    // ... tương tự cho photos và milestones
    this.prisma.family_members.count({
      where: {
        user_id: userId,
        status: 'active',
      },
    }),
  ]);

  return {
    kids: kidsCount,
    albums: albumsCount,
    photos: photosCount,
    milestones: milestonesCount,
    families: familiesCount,
  };
}
```

---

## Cách implement:

1. **Import helper vào mỗi service:**
```typescript
import { buildFamilyAccessWhere, checkFamilyAccess, getUserFamilyIds } from '../common/helpers/family-access.helper';
```

2. **Update các controllers để pass user role:**
```typescript
// Trong controller
@Get()
async findAll(@GetUser('id') userId: string, @GetUser('role') userRole: string) {
  return this.service.findAll(userId, userRole);
}
```

3. **Update DTOs để thêm family_id field:**
```typescript
// create-kid.dto.ts
@IsOptional()
@IsString()
family_id?: string;
```

---

## Testing checklist:

- [ ] User tạo family
- [ ] User mời member vào family
- [ ] Member accept invitation
- [ ] Member tạo kid/album gán vào family
- [ ] Member khác trong family xem được kid/album
- [ ] User không trong family KHÔNG xem được
- [ ] Admin xem được tất cả
- [ ] Owner/admin family edit được resources
- [ ] Member thường chỉ xem, không edit

---

## Lưu ý:

- **Performance**: Family access queries có thể chậm, cân nhắc cache familyIds
- **Security**: Luôn check quyền ở service layer, không tin client
- **Migration**: Existing data không có family_id, vẫn hoạt động bình thường (chỉ owner xem được)
