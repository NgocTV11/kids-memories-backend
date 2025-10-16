import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Tạo admin user
  const adminPasswordHash = await bcrypt.hash('Admin123456', 12);
  
  const admin = await prisma.users.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password_hash: adminPasswordHash,
      display_name: 'Admin User',
      role: 'admin',
      language: 'vi',
    },
  });
  
  console.log('✅ Admin user created:');
  console.log('   Email:', admin.email);
  console.log('   Password: Admin123456');
  console.log('   Role:', admin.role);
  console.log('');

  // Tạo test user
  const userPasswordHash = await bcrypt.hash('User123456', 12);
  
  const user = await prisma.users.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password_hash: userPasswordHash,
      display_name: 'Test User',
      role: 'family_member',
      language: 'vi',
    },
  });
  
  console.log('✅ Test user created:');
  console.log('   Email:', user.email);
  console.log('   Password: User123456');
  console.log('   Role:', user.role);
  console.log('');

  console.log('🎉 Seeding completed!\n');
  console.log('📝 You can now login with:');
  console.log('   Admin: admin@example.com / Admin123456');
  console.log('   User:  user@example.com / User123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
