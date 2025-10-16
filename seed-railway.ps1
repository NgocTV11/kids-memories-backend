# Script để seed users vào Railway Database
Write-Host "🌱 Seeding users to Railway Database..." -ForegroundColor Green
Write-Host ""

# Set DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:FieYCjXZvCNmKuVrlVrcnCBgEWaRuMvr@switchyard.proxy.rlwy.net:24047/railway"

Write-Host "📦 Database URL set" -ForegroundColor Yellow
Write-Host ""

# Chạy seed
Write-Host "🚀 Running seed script..." -ForegroundColor Cyan
npx ts-node prisma/seed.ts

Write-Host ""
Write-Host "✅ Done! Check the output above." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Login credentials:" -ForegroundColor Yellow
Write-Host "   Admin: admin@example.com / Admin123456" -ForegroundColor White
Write-Host "   User:  user@example.com / User123456" -ForegroundColor White
Write-Host ""
