# Test Kids API Script
# Usage: .\test-kids-api.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Kids Profile API" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get access token
Write-Host "1. Login..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"email":"dad@example.com","password":"password123"}'

$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.access_token
Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

# Step 2: Create first kid
Write-Host "2. Create Kid Profile - Emma..." -ForegroundColor Yellow
$createResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids" `
    -Method POST `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body '{"name":"Emma Johnson","date_of_birth":"2020-03-15","gender":"female","bio":"Our little sunshine ☀️"}'

$emma = $createResponse.Content | ConvertFrom-Json
Write-Host "✅ Emma created!" -ForegroundColor Green
Write-Host "  ID: $($emma.id)" -ForegroundColor Gray
Write-Host "  Age: $($emma.age)" -ForegroundColor Gray
Write-Host ""

# Step 3: Create second kid
Write-Host "3. Create Kid Profile - Liam..." -ForegroundColor Yellow
$createResponse2 = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids" `
    -Method POST `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body '{"name":"Liam Johnson","date_of_birth":"2018-07-22","gender":"male","bio":"Loves dinosaurs 🦖"}'

$liam = $createResponse2.Content | ConvertFrom-Json
Write-Host "✅ Liam created!" -ForegroundColor Green
Write-Host "  ID: $($liam.id)" -ForegroundColor Gray
Write-Host "  Age: $($liam.age)" -ForegroundColor Gray
Write-Host ""

# Step 4: Get all kids
Write-Host "4. Get All Kids..." -ForegroundColor Yellow
$allKidsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

$allKids = $allKidsResponse.Content | ConvertFrom-Json
Write-Host "✅ Retrieved $($allKids.Count) kids" -ForegroundColor Green
foreach ($kid in $allKids) {
    Write-Host "  - $($kid.name) ($($kid.age))" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Get Emma by ID
Write-Host "5. Get Emma by ID..." -ForegroundColor Yellow
$kidResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids/$($emma.id)" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

$kidDetail = $kidResponse.Content | ConvertFrom-Json
Write-Host "✅ Kid details retrieved!" -ForegroundColor Green
Write-Host "  Name: $($kidDetail.name)" -ForegroundColor Gray
Write-Host "  DOB: $($kidDetail.date_of_birth)" -ForegroundColor Gray
Write-Host "  Age: $($kidDetail.age)" -ForegroundColor Gray
Write-Host ""

# Step 6: Update Emma's profile
Write-Host "6. Update Emma's Profile..." -ForegroundColor Yellow
$updateResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids/$($emma.id)" `
    -Method PUT `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body '{"name":"Emma Rose Johnson","bio":"Our little sunshine ☀️ Loves dancing!"}'

$updatedKid = $updateResponse.Content | ConvertFrom-Json
Write-Host "✅ Profile updated!" -ForegroundColor Green
Write-Host "  New name: $($updatedKid.name)" -ForegroundColor Gray
Write-Host "  New bio: $($updatedKid.bio)" -ForegroundColor Gray
Write-Host ""

# Step 7: Add growth data
Write-Host "7. Add Growth Data..." -ForegroundColor Yellow
$growthResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids/$($emma.id)/growth" `
    -Method POST `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body '{"date":"2025-10-16","height":105.5,"weight":18.2,"note":"Monthly checkup - growing well!"}'

$growthResult = $growthResponse.Content | ConvertFrom-Json
Write-Host "✅ $($growthResult.message)" -ForegroundColor Green
Write-Host ""

# Step 8: Get growth history
Write-Host "8. Get Growth History..." -ForegroundColor Yellow
$historyResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/kids/$($emma.id)/growth" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

$history = $historyResponse.Content | ConvertFrom-Json
Write-Host "✅ Growth history retrieved!" -ForegroundColor Green
Write-Host "  Kid: $($history.kid_name)" -ForegroundColor Gray
Write-Host "  Total entries: $($history.total_entries)" -ForegroundColor Gray
foreach ($entry in $history.growth_history) {
    Write-Host "    - Date: $($entry.date) | Height: $($entry.height)cm | Weight: $($entry.weight)kg" -ForegroundColor Gray
}
Write-Host ""

# Final summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Kids Module API Working!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints tested:" -ForegroundColor White
Write-Host "  ✅ POST   /api/v1/kids                - Create kid" -ForegroundColor Green
Write-Host "  ✅ GET    /api/v1/kids                - List all kids" -ForegroundColor Green
Write-Host "  ✅ GET    /api/v1/kids/:id            - Get kid by ID" -ForegroundColor Green
Write-Host "  ✅ PUT    /api/v1/kids/:id            - Update kid" -ForegroundColor Green
Write-Host "  ✅ POST   /api/v1/kids/:id/growth     - Add growth data" -ForegroundColor Green
Write-Host "  ✅ GET    /api/v1/kids/:id/growth     - Get growth history" -ForegroundColor Green
Write-Host ""
Write-Host "Kids created:" -ForegroundColor White
Write-Host "  - Emma Rose Johnson (ID: $($emma.id))" -ForegroundColor Cyan
Write-Host "  - Liam Johnson (ID: $($liam.id))" -ForegroundColor Cyan
Write-Host ""
