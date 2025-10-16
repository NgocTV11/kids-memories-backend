@echo off
echo ========================================
echo Fix Backend TypeScript Errors
echo Regenerate Prisma Client
echo ========================================
echo.

cd /d "C:\Users\NgocTV11\Desktop\AI_pp\kids-memories\source\backend\kids-memories-api"

echo Current directory: %CD%
echo.

echo STEP 1: Checking Prisma schema...
if exist "prisma\schema.prisma" (
    echo [OK] Prisma schema found
) else (
    echo [ERROR] Prisma schema not found!
    pause
    exit /b 1
)
echo.

echo STEP 2: Generating Prisma Client...
echo This will regenerate TypeScript types for database models
echo.

call npx prisma generate

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS: Prisma Client Generated!
    echo ========================================
    echo.
    echo What was fixed:
    echo - prisma.families.*
    echo - prisma.family_members.*
    echo - Updated kids with family_id
    echo - Updated albums with family_id
    echo.
    echo Next steps:
    echo 1. Restart backend: npm run start:dev
    echo 2. Check VS Code - all red errors should be gone
    echo 3. Test API endpoints
    echo.
) else (
    echo.
    echo ========================================
    echo FAILED: Prisma Generate Error
    echo ========================================
    echo.
    echo Common solutions:
    echo 1. Stop backend server first (Ctrl+C)
    echo 2. Close VS Code
    echo 3. Try: npx prisma db push
    echo 4. Then run this script again
    echo.
)

pause
