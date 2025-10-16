"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...\n');
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
//# sourceMappingURL=seed.js.map