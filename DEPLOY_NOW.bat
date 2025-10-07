@echo off
REM Google Analytics CSP Fix - Production Deployment Script (Windows)
REM Run this to build and prepare for production deployment

echo =========================================
echo 🚀 GA CSP Fix - Building for Production
echo =========================================
echo.

cd /d "%~dp0"

echo 📦 Step 1: Installing dependencies (if needed)...
call npm install

echo.
echo 🏗️  Step 2: Building production bundle...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =========================================
    echo ✅ BUILD SUCCESSFUL!
    echo =========================================
    echo.
    echo 📋 Next Steps:
    echo.
    echo 1. Deploy the .output/ folder to your production server:
    echo    - Upload .output/ directory
    echo    - Or use your CI/CD pipeline
    echo.
    echo 2. Restart your production server:
    echo    - pm2 restart meridian-app
    echo    - OR systemctl restart your-service
    echo.
    echo 3. Test on production (in Incognito mode^):
    echo    - Open: https://meridiansport.rs/ga-test.html
    echo    - All tests should pass ✅
    echo    - Check Network tab for POST to /g/collect
    echo.
    echo 4. Verify in Google Analytics:
    echo    - Open GA Real-time reports
    echo    - Should see activity immediately
    echo.
    echo =========================================
    echo 📂 Build output is in: .output/
    echo =========================================
) else (
    echo.
    echo =========================================
    echo ❌ BUILD FAILED!
    echo =========================================
    echo.
    echo Please check the error messages above and fix any issues.
    exit /b 1
)

pause

