@echo off
setlocal enabledelayedexpansion

REM Set backup directory and timestamp
set BACKUP_DIR=backups
set TIMESTAMP=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%
set TIMESTAMP=!TIMESTAMP: =0!

REM Create backup directories if they don't exist
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
if not exist %BACKUP_DIR%\mongodb mkdir %BACKUP_DIR%\mongodb
if not exist %BACKUP_DIR%\logs mkdir %BACKUP_DIR%\logs
if not exist %BACKUP_DIR%\config mkdir %BACKUP_DIR%\config

REM Backup MongoDB
echo Backing up MongoDB...
docker-compose exec -T mongodb mongodump --archive > %BACKUP_DIR%\mongodb\mongodb_backup_%TIMESTAMP%.archive

REM Backup logs
echo Backing up logs...
xcopy /s /i /y logs %BACKUP_DIR%\logs\logs_%TIMESTAMP%

REM Backup configuration files
echo Backing up configuration files...
xcopy /s /i /y config %BACKUP_DIR%\config\config_%TIMESTAMP%
xcopy /s /i /y .env* %BACKUP_DIR%\config\config_%TIMESTAMP%

REM Clean up old backups (keep last 7 days)
echo Cleaning up old backups...
forfiles /p %BACKUP_DIR% /s /m * /d -7 /c "cmd /c del @path" 2>nul

echo Backup completed successfully!
echo Backup location: %BACKUP_DIR%
pause
