@echo off
echo GitHub Repository Creation Script
echo =================================
echo.

set GH_PATH="C:\Program Files\GitHub CLI\gh.exe"

echo Checking GitHub CLI authentication...
%GH_PATH% auth status 2>nul
if %errorlevel% neq 0 (
    echo.
    echo You need to authenticate with GitHub first.
    echo Please run the following command:
    echo.
    echo %GH_PATH% auth login
    echo.
    echo Follow the prompts to authenticate, then run this script again.
    pause
    exit /b 1
)

echo.
echo Creating GitHub repository...
cd /d "C:\Users\USER\Documents\multi-agent-system-creation-test"

%GH_PATH% repo create multi-agent-system-creation-test --public --source=. --description="Autonomous multi-agent system for pain point discovery using n8n, React, and LLM validation" --push

if %errorlevel% equ 0 (
    echo.
    echo Successfully created and pushed repository!
    echo.
    echo Repository URL: https://github.com/YOUR_USERNAME/multi-agent-system-creation-test
    echo.
    echo Next steps:
    echo 1. Visit your repository on GitHub
    echo 2. Set up n8n workflows as described in docs/n8n-workflow-setup.md
    echo 3. Deploy the frontend application
) else (
    echo.
    echo Failed to create repository. Please check the error message above.
)

pause
