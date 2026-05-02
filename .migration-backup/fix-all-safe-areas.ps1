# Complete safe area fix - all pages
# This adds the appropriate safe-area class to EVERY page in the site

$files = @{
    # BLACK PAGES
    "app\contact\page.tsx" = 'className="min-h-screen bg-black text-white"', 'className="min-h-screen bg-black safe-area-black text-white"'
    "app\faq\page.tsx" = 'className="min-h-screen bg-black text-white"', 'className="min-h-screen bg-black safe-area-black text-white"'
    "app\privacy\page.tsx" = 'className="min-h-screen bg-black text-white"', 'className="min-h-screen bg-black safe-area-black text-white"'
    "app\refund-policy\page.tsx" = 'className="min-h-screen bg-black text-white"', 'className="min-h-screen bg-black safe-area-black text-white"'
    "app\about\page.tsx" = 'className="min-h-screen bg-black text-white"', 'className="min-h-screen bg-black safe-area-black text-white"'
    "app\dashboard\rider\page.tsx" = 'className="min-h-screen bg-black text-white selection:bg-primary/30"', 'className="min-h-screen bg-black safe-area-black text-white selection:bg-primary/30"'
    
    # GRADIENT PAGES  
    "app\terms\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black"', 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black"'
    "app\signin\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black"', 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black"'
    "app\signup\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black"', 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black"'
    "app\pricing\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black relative overflow-hidden"', 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black relative overflow-hidden"'
    "app\offline\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex items-center justify-center p-4"', 'className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black safe-area-black flex items-center justify-center p-4"'
    "app\subscriptions\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white"', 'className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black safe-area-black text-white"'
    "app\dashboard\stable\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"', 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'
    "app\dashboard\analytics\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"', 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'
    "app\dashboard\admin\horse-changes\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"', 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'
    "app\dashboard\admin\locations\page.tsx" = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"', 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'
}

$baseDir = "C:\Users\Administrator\Desktop\pyraride"
$updated = 0

foreach ($file in $files.Keys) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $old, $new = $files[$file]
        
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            Set-Content $fullPath -Value $content -NoNewline
            Write-Host "✓ $file" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "⊘ $file (pattern not found)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ $file (not found)" -ForegroundColor Red
    }
}

Write-Host "`nUpdated $updated files" -ForegroundColor Cyan
