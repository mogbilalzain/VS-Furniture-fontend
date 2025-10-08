@echo off
echo Starting VS Next.js Project with Docker (Production Mode)...

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running. Building and starting containers...

REM Production mode
echo.
echo Starting in Production Mode...
docker-compose --profile prod up --build

pause

