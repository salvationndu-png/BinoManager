@echo off
REM BinoManager - Pre-Testing Setup Script
REM This script prepares the application for testing

echo ========================================
echo BinoManager Pre-Testing Setup
echo ========================================
echo.

echo [1/6] Clearing all caches...
php artisan optimize:clear
if %errorlevel% neq 0 (
    echo ERROR: Failed to clear caches
    pause
    exit /b 1
)
echo SUCCESS: Caches cleared
echo.

echo [2/6] Caching configuration...
php artisan config:cache
if %errorlevel% neq 0 (
    echo ERROR: Failed to cache config
    pause
    exit /b 1
)
echo SUCCESS: Configuration cached
echo.

echo [3/6] Caching routes...
php artisan route:cache
if %errorlevel% neq 0 (
    echo ERROR: Failed to cache routes
    pause
    exit /b 1
)
echo SUCCESS: Routes cached
echo.

echo [4/6] Running database migrations...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)
echo SUCCESS: Migrations completed
echo.

echo [5/6] Building frontend assets...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)
echo SUCCESS: Frontend built
echo.

echo [6/6] Checking system status...
php artisan about
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT REMINDERS:
echo 1. Update .env file with proper settings
echo 2. Change APP_ENV to 'staging'
echo 3. Change APP_DEBUG to 'false'
echo 4. Update SUPER_ADMIN_PASSWORD
echo 5. Verify email configuration
echo 6. Configure payment gateway
echo.
echo To start the server:
echo   php artisan serve
echo.
echo To start queue worker:
echo   php artisan queue:work
echo.
echo Review PRE_TESTING_CHECKLIST.md for full details
echo.
pause
