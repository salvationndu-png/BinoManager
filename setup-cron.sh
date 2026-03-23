#!/bin/bash

# BinoManager - Laravel Scheduler Cron Setup Script
# This script sets up the Laravel scheduler to run automatically

echo "=========================================="
echo "BinoManager - Cron Setup Script"
echo "=========================================="
echo ""

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Project directory: $SCRIPT_DIR"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  WARNING: Running as root. This will add cron for root user."
    echo "   Consider running as the web server user (e.g., www-data)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create the cron entry
CRON_ENTRY="* * * * * cd $SCRIPT_DIR && php artisan schedule:run >> /dev/null 2>&1"

echo "Cron entry to be added:"
echo "$CRON_ENTRY"
echo ""

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "artisan schedule:run"; then
    echo "✅ Cron entry already exists!"
    echo ""
    echo "Current crontab:"
    crontab -l | grep "artisan schedule:run"
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping cron setup."
        exit 0
    fi
    
    # Remove old entry
    crontab -l | grep -v "artisan schedule:run" | crontab -
    echo "Old entry removed."
fi

# Add new cron entry
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo ""
echo "✅ Cron job added successfully!"
echo ""
echo "Current crontab:"
crontab -l
echo ""
echo "=========================================="
echo "Scheduler Tasks:"
echo "=========================================="
php artisan schedule:list
echo ""
echo "=========================================="
echo "Testing scheduler (dry run):"
echo "=========================================="
php artisan schedule:run --verbose
echo ""
echo "✅ Setup complete!"
echo ""
echo "The scheduler will now run every minute and execute:"
echo "  - Session cleanup (daily at 00:00)"
echo "  - Suspend expired tenants (daily at 02:00)"
echo "  - Trial expiring notifications (daily at 09:00)"
echo "  - Grace period warnings (daily at 09:00)"
echo ""
echo "To test manually: php artisan schedule:work"
echo "To view logs: tail -f storage/logs/laravel.log"
