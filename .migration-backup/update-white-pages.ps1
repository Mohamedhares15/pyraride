# Bulk update white background pages with safe-area-white class
$files = @(
    "app\stables\StablesClient.tsx",
    "app\stables\[id]\page.tsx",
    "app\studios\page.tsx",
    "app\reset-password\page.tsx",
    "app\payment\cancel\page.tsx",
    "app\forgot-password\page.tsx",
    "app\dashboard\stable\manage\page.tsx",
    "app\dashboard\stable\horses\page.tsx",
    "app\dashboard\cx-media\layout.tsx",
    "app\dashboard\admin\stables\page.tsx",
    "app\dashboard\admin\premium\page.tsx",
    "app\dashboard\admin\horses\page.tsx"
)

$baseDir = "C:\Users\Administrator\Desktop\pyraride"

foreach ($file in $files) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        Write-Host "Updating: $file"
        $content = Get-Content $fullPath -Raw
        # Add safe-area-white to bg-background pages
        $content = $content -replace 'className="min-h-screen bg-background', 'className="min-h-screen bg-background safe-area-white'
        Set-Content $fullPath -Value $content -NoNewline
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Updated $($ files.Count) files" -ForegroundColor Green
