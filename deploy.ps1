# PyraRide Deployment Script
# Run this script to deploy your application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PyraRide - Complete Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if in correct directory
Write-Host "[1/5] Checking project directory..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✓ Project found!" -ForegroundColor Green
} else {
    Write-Host "✗ Please run this script from the pyraride directory" -ForegroundColor Red
    exit 1
}

# Step 2: Check git status
Write-Host "[2/5] Checking git status..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Current git status:" -ForegroundColor White
git status
Write-Host ""

# Step 3: Show recent commits
Write-Host "[3/5] Recent commits:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Step 4: Instructions for manual steps
Write-Host "[4/5] Manual Steps Required:" -ForegroundColor Yellow
Write-Host ""
Write-Host "To complete deployment, you need to:" -ForegroundColor White
Write-Host ""
Write-Host "1. GITHUB:" -ForegroundColor Cyan
Write-Host "   - Open: https://github.com/Mohamedhares15/pyraride" -ForegroundColor White
Write-Host "   - Check if your latest changes are there" -ForegroundColor White
Write-Host "   - If not, push manually" -ForegroundColor White
Write-Host ""
Write-Host "2. VERCEL:" -ForegroundColor Cyan
Write-Host "   - Open: https://vercel.com/new" -ForegroundColor White
Write-Host "   - Import: github.com/Mohamedhares15/pyraride" -ForegroundColor White
Write-Host "   - Add environment variables (see DEPLOY_NOW.md)" -ForegroundColor White
Write-Host "   - Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "3. NEON DATABASE:" -ForegroundColor Cyan
Write-Host "   - Open: https://console.neon.tech" -ForegroundColor White
Write-Host "   - Go to SQL Editor" -ForegroundColor White
Write-Host "   - Run: database_setup_neon.sql" -ForegroundColor White
Write-Host ""

# Step 5: Generate quick reference
Write-Host "[5/5] Generating deployment info..." -ForegroundColor Yellow

$envVars = @"
DATABASE_URL=<Get from Neon>
NEXTAUTH_SECRET=nORyje1HDo0LSAlpqqSrSedN2ZEAsb2Tt4EwsIwZumU=
NEXTAUTH_URL=<Update after deployment>
NODE_ENV=production
"@

$envVars | Out-File -FilePath "vencel-env-vars.txt" -Encoding UTF8
Write-Host "✓ Created vencel-env-vars.txt" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Check your GitHub repository" -ForegroundColor White
Write-Host "2. Deploy on Vercel (use vencel-env-vars.txt for env vars)" -ForegroundColor White
Write-Host "3. Set up Neon database (run database_setup_neon.sql)" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  - DEPLOY_NOW.md (full guide)" -ForegroundColor White
Write-Host "  - QUICK_DEPLOY_CHECKLIST.md (checklist)" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

