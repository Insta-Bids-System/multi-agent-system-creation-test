# Test Runner Script for Multi-Agent System (Windows)

Write-Host "🚀 Multi-Agent System Test Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

# Function to run tests
function Run-Test {
    param(
        [string]$TestName,
        [string]$TestCommand
    )
    
    Write-Host "`nRunning: $TestName" -ForegroundColor Yellow
    Write-Host "----------------------------------------"
    
    $result = Invoke-Expression $TestCommand
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✓ $TestName passed" -ForegroundColor Green
        return 0
    } else {
        Write-Host "✗ $TestName failed" -ForegroundColor Red
        return 1
    }
}

# Track test results
$FailedTests = 0

# Run Frontend Tests
Write-Host "`nFrontend Tests" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow

Set-Location frontend

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

# Run unit tests
$FailedTests += Run-Test "Unit Tests" "npm run test:unit -- --watchAll=false"

# Run integration tests (only if not in CI)
if (-not $env:CI) {
    $FailedTests += Run-Test "Integration Tests" "npm run test:integration -- --watchAll=false"
} else {
    Write-Host "Skipping integration tests in CI environment" -ForegroundColor Yellow
}

# Run coverage report
$FailedTests += Run-Test "Coverage Report" "npm run test:coverage"

Set-Location ..

# Validate JSON Schemas
Write-Host "`nSchema Validation" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow

# Check if ajv-cli is installed
$ajvInstalled = Get-Command ajv -ErrorAction SilentlyContinue
if (-not $ajvInstalled) {
    Write-Host "Installing ajv-cli for schema validation..."
    npm install -g ajv-cli
}

# Validate schemas
$FailedTests += Run-Test "Scoping Session Schema" "ajv compile -s schemas/scoping-session-output.json"
$FailedTests += Run-Test "Validation Report Schema" "ajv compile -s schemas/validation-report.json"

# Check n8n Workflow Files
Write-Host "`nn8n Workflow Validation" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

Get-ChildItem -Path "n8n-workflows" -Filter "*.json" -Recurse | ForEach-Object {
    $workflow = $_.FullName
    $testName = "Validate $($_.Name)"
    
    try {
        $json = Get-Content $workflow -Raw | ConvertFrom-Json
        Write-Host "✓ $testName passed" -ForegroundColor Green
    } catch {
        Write-Host "✗ $testName failed" -ForegroundColor Red
        $FailedTests++
    }
}

# Summary
Write-Host "`nTest Summary" -ForegroundColor Yellow
Write-Host "============" -ForegroundColor Yellow

if ($FailedTests -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ $FailedTests test(s) failed" -ForegroundColor Red
    exit 1
}
