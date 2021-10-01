@echo off

if not exist .env (
    echo "Copying file"
    copy .env.example .env
)

if not exist node_modules (
    echo "Installing dependencies"
    call npm install > nul 2>&1
    echo "Installation Completed"
)

cls

SET ADMIN_MODE=false

FOR %%A IN (%*) DO (
    IF "%%A"=="--admin" SET ADMIN_MODE=true
    IF "%%A"=="--ADMIN" SET ADMIN_MODE=true
    IF "%%A"=="/a" SET ADMIN_MODE=true
    IF "%%A"=="/A" SET ADMIN_MODE=true
)

if "%ADMIN_MODE%" == "true" (
    if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)
)

npm run start