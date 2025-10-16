import * as bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  console.log('\n🔐 Generating password hash...\n');
  console.log('Password:', password);
  
  const hash = await bcrypt.hash(password, 12);
  console.log('Hash:', hash);
  console.log('\n📋 Copy hash này để insert vào database\n');
  
  // Generate SQL
  console.log('📝 SQL để insert user:\n');
  console.log(`INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  role,
  language,
  is_deleted,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'your-email@example.com',  -- Thay email của bạn
  '${hash}',
  'Your Name',                -- Thay tên của bạn
  'family_member',            -- hoặc 'admin'
  'vi',
  false,
  NOW(),
  NOW()
);\n`);
}

// Lấy password từ command line hoặc dùng default
const password = process.argv[2] || 'Password123';
hashPassword(password);
