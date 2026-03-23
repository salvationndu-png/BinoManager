@echo off
REM BinoManager - Windows Task Scheduler Setup Script
REM This script sets up the Laravel scheduler to run automatically on Windows

echo ==========================================
echo BinoManager - Task Scheduler Setup
echo ==========================================
echo.

REM Get the current directory
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo Project directory: %PROJECT_DIR%
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Creating scheduled task...
echo.

REM Delete existing task if it exists
schtasks /query /tn "BinoManager-Scheduler" >nul 2>&1
if %errorLevel% equ 0 (
    echo Removing existing task...
    schtasks /delete /tn "BinoManager-Scheduler" /f
)

REM Create new task that runs every minute
schtasks /create /tn "BinoManager-Scheduler" /tr "php %PROJECT_DIR%\artisan schedule:run" /sc minute /mo 1 /ru "SYSTEM" /f

if %errorLevel% equ 0 (
    echo.
    echo ✓ Task created successfully!
    echo.
    echo Task details:
    schtasks /query /tn "BinoManager-Scheduler" /fo list /v
    echo.
    echo ==========================================
    echo Scheduler Tasks:
    echo ==========================================
    php artisan schedule:list
    echo.
    echo ==========================================
    echo Testing scheduler (dry run):
    echo ==========================================
    php artisan schedule:run --verbose
    echo.
    echo ✓ Setup complete!
    echo.
    echo The scheduler will now run every minute and execute:
    echo   - Session cleanup (daily at 00:00^)
    echo   - Suspend expired tenants (daily at 02:00^)
    echo   - Trial expiring notifications (daily at 09:00^)
    echo   - Grace period warnings (daily at 09:00^)
    echo.
    echo To test manually: php artisan schedule:work
    echo To view logs: type storage\logs\laravel.log
) else (
    echo.
    echo ERROR: Failed to create scheduled task
    echo Error code: %errorLevel%
)

echo.
pause
