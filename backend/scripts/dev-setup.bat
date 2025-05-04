@echo off
setlocal

REM Set environment variables
set NODE_ENV=development

REM Create necessary directories
if not exist logs mkdir logs
if not exist nginx\ssl mkdir nginx\ssl

REM Generate SSL certificates if they don't exist
if not exist nginx\ssl\server.crt (
    call scripts\generate-ssl.bat
)

REM Stop any running containers
echo Stopping running containers...
docker-compose -f docker-compose.dev.yml down

REM Build development containers
echo Building development containers...
docker-compose -f docker-compose.dev.yml build

REM Start development environment
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up -d

REM Show container status
echo Container status:
docker-compose -f docker-compose.dev.yml ps

echo Development environment setup complete!
echo Access the application at: http://localhost:3000
echo Access MongoDB Express at: http://localhost:8081
pause
