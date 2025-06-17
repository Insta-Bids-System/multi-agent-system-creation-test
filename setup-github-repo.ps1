# GitHub Repository Setup Script

Write-Host "GitHub Repository Creation Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$ghPath = "C:\Program Files\GitHub CLI\gh.exe"

# Check if GitHub CLI exists
if (-not (Test-Path $ghPath)) {
    Write-Host "GitHub CLI not found at: $ghPath" -ForegroundColor Red
    Write-Host "Please install GitHub CLI from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check authentication status
Write-Host "Checking GitHub CLI authentication..." -ForegroundColor Yellow
& $ghPath auth status 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "You need to authenticate with GitHub first." -ForegroundColor Yellow
    Write-Host "Please run the following command:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  & '$ghPath' auth login" -ForegroundColor Green
    Write-Host ""
    Write-Host "Choose the following options during authentication:" -ForegroundColor Cyan
    Write-Host "  - GitHub.com" -ForegroundColor White
    Write-Host "  - HTTPS" -ForegroundColor White
    Write-Host "  - Login with a web browser (recommended)" -ForegroundColor White
    Write-Host ""
    Write-Host "After authentication, run this script again." -ForegroundColor Yellow
    
    # Offer to start authentication
    $response = Read-Host "Would you like to start authentication now? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        & $ghPath auth login
    }
    exit 0
}

Write-Host "✓ Authenticated with GitHub" -ForegroundColor Green
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\USER\Documents\multi-agent-system-creation-test"

# Create and push repository
Write-Host "Creating GitHub repository..." -ForegroundColor Yellow
$repoName = "multi-agent-system-creation-test"
$description = "Autonomous multi-agent system for pain point discovery using n8n, React, and LLM validation"

try {
    # Create the repository
    & $ghPath repo create $repoName `
        --public `
        --source=. `
        --description=$description `
        --push `
        --remote=origin

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully created and pushed repository!" -ForegroundColor Green
        Write-Host ""
        
        # Get the repository URL
        $repoUrl = & $ghPath repo view --json url -q ".url"
        Write-Host "Repository URL: $repoUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Visit your repository on GitHub" -ForegroundColor White
        Write-Host "2. Set up n8n workflows as described in docs/n8n-workflow-setup.md" -ForegroundColor White
        Write-Host "3. Deploy the frontend application" -ForegroundColor White
        Write-Host ""
        
        # Offer to open in browser
        $openBrowser = Read-Host "Would you like to open the repository in your browser? (Y/N)"
        if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
            & $ghPath repo view --web
        }
    } else {
        Write-Host ""
        Write-Host "Failed to create repository." -ForegroundColor Red
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "- Repository name already exists" -ForegroundColor White
        Write-Host "- Network connectivity issues" -ForegroundColor White
        Write-Host "- Insufficient permissions" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
