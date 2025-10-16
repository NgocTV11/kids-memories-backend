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
const bcrypt = __importStar(require("bcrypt"));
async function hashPassword(password) {
    console.log('\n🔐 Generating password hash...\n');
    console.log('Password:', password);
    const hash = await bcrypt.hash(password, 12);
    console.log('Hash:', hash);
    console.log('\n📋 Copy hash này để insert vào database\n');
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
const password = process.argv[2] || 'Password123';
hashPassword(password);
//# sourceMappingURL=hash-password.js.map