@echo off
setlocal

REM Set environment variables
set NODE_ENV=production

REM Stop running containers
echo Stopping running containers...
docker-compose down

REM Remove old images
echo Removing old images...
docker image prune -f

REM Build new images
echo Building new images...
docker-compose build

REM Start containers
echo Starting containers...
docker-compose up -d

REM Show container status
echo Container status:
docker-compose ps

echo Deployment complete!
pause
