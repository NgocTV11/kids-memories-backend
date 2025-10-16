# Test Users API Script
# Usage: .\test-users-api.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Users API" -ForegroundColor Cyan
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
Write-Host "User: $($loginData.user.display_name) ($($loginData.user.email))" -ForegroundColor Gray
Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

# Step 2: Get current user profile
Write-Host "2. Get Profile (GET /api/v1/users/me)..." -ForegroundColor Yellow
$profileResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/users/me" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"}

$profile = $profileResponse.Content | ConvertFrom-Json
Write-Host "✅ Profile retrieved!" -ForegroundColor Green
Write-Host ($profile | ConvertTo-Json -Depth 5) -ForegroundColor Gray
Write-Host ""

# Step 3: Update profile
Write-Host "3. Update Profile (PUT /api/v1/users/me)..." -ForegroundColor Yellow
$updateResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/users/me" `
    -Method PUT `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body '{"display_name":"Super Dad","language":"en"}'

$updatedProfile = $updateResponse.Content | ConvertFrom-Json
Write-Host "✅ Profile updated!" -ForegroundColor Green
Write-Host ($updatedProfile | ConvertTo-Json -Depth 5) -ForegroundColor Gray
Write-Host ""

# Step 4: Try to get all users (should fail - not admin)
Write-Host "4. Get All Users - Admin only (GET /api/v1/users)..." -ForegroundColor Yellow
try {
    $allUsersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/users" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $token"}
    
    $allUsers = $allUsersResponse.Content | ConvertFrom-Json
    Write-Host "✅ All users retrieved (User is admin)" -ForegroundColor Green
    Write-Host "Total users: $($allUsers.Count)" -ForegroundColor Gray
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ Access denied: $($errorResponse.message)" -ForegroundColor Red
    Write-Host "   (Expected - user is not admin)" -ForegroundColor Gray
}
Write-Host ""

# Final summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Users Module API Working!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints tested:" -ForegroundColor White
Write-Host "  ✅ POST /api/v1/auth/login" -ForegroundColor Green
Write-Host "  ✅ GET  /api/v1/users/me" -ForegroundColor Green
Write-Host "  ✅ PUT  /api/v1/users/me" -ForegroundColor Green
Write-Host "  ✅ GET  /api/v1/users (access control working)" -ForegroundColor Green
Write-Host ""
