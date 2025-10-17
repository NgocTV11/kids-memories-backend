#!/usr/bin/env node
/**
 * Debug script - Kiểm tra JWT token admin
 * Usage: node debug-admin-token.js <token>
 */

const jwt = require('jsonwebtoken');

const token = process.argv[2];

if (!token) {
  console.log('\n❌ Thiếu token!');
  console.log('\n📝 Cách dùng:');
  console.log('node debug-admin-token.js <your-jwt-token>');
  console.log('\n💡 Lấy token từ:');
  console.log('1. Frontend localStorage: localStorage.getItem("accessToken")');
  console.log('2. Browser DevTools → Application → Local Storage');
  console.log('3. Network tab → Headers → Authorization: Bearer <token>\n');
  process.exit(1);
}

console.log('\n🔍 Decoding JWT token...\n');

try {
  // Decode without verification (chỉ để xem payload)
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded) {
    console.log('❌ Invalid token format\n');
    process.exit(1);
  }

  console.log('✅ Token decoded successfully!\n');
  console.log('📋 Header:');
  console.log(JSON.stringify(decoded.header, null, 2));
  console.log('\n📦 Payload:');
  console.log(JSON.stringify(decoded.payload, null, 2));

  // Check admin role
  const payload = decoded.payload;
  const role = payload.role || payload.userRole || payload.user?.role;

  console.log('\n🔐 Role Check:');
  console.log(`   Role field: ${role}`);
  
  if (role === 'admin') {
    console.log('   ✅ User is ADMIN - Should have full access');
  } else if (role === 'user') {
    console.log('   ⚠️  User is USER - Limited access');
  } else {
    console.log('   ❌ Unknown role or missing role field!');
  }

  // Check expiration
  if (payload.exp) {
    const expDate = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = now > expDate;

    console.log('\n⏰ Expiration:');
    console.log(`   Expires at: ${expDate.toLocaleString()}`);
    console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
    
    if (!isExpired) {
      const timeLeft = expDate - now;
      const hoursLeft = Math.floor(timeLeft / 1000 / 60 / 60);
      const minutesLeft = Math.floor((timeLeft / 1000 / 60) % 60);
      console.log(`   Time left: ${hoursLeft}h ${minutesLeft}m`);
    }
  }

  // Check user ID
  if (payload.sub || payload.userId || payload.id) {
    console.log('\n👤 User Info:');
    console.log(`   User ID: ${payload.sub || payload.userId || payload.id}`);
    if (payload.email) console.log(`   Email: ${payload.email}`);
    if (payload.display_name) console.log(`   Name: ${payload.display_name}`);
  }

  console.log('\n');

} catch (error) {
  console.log('❌ Error decoding token:');
  console.log(error.message);
  console.log('\n');
  process.exit(1);
}
