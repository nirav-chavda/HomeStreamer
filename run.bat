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
    REM  --> Check for permissions
    >nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

    REM --> If error flag set, we do not have admin.
    if '%errorlevel%' NEQ '0' (
        echo Requesting administrative privileges...
        goto UACPrompt
    ) else ( goto gotAdmin )

    :UACPrompt
        echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
        set params = %*:"="
        echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"

        "%temp%\getadmin.vbs"
        del "%temp%\getadmin.vbs"
        exit /B

    :gotAdmin
        pushd "%CD%"
        CD /D "%~dp0"
)

npm run start