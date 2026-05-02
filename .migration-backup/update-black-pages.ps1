# Bulk update all black/dark pages with safe-area-black class
$updates = @{
    # Solid black pages
    "app\users\[id]\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white flex items-center justify'; new = 'className="min-h-screen bg-black safe-area-black text-white flex items-center justify'},
        @{old = 'className="min-h-screen bg-black text-white flex flex-col items'; new = 'className="min-h-screen bg-black safe-area-black text-white flex flex-col items'}
    )
    "app\signup\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black flex items-center'; new = 'className="min-h-screen bg-black safe-area-black flex items-center'}
    )
    " app\signin\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black flex items-center'; new = 'className="min-h-screen bg-black safe-area-black flex items-center'}
    )
    "app\refund-policy\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white"'; new = 'className="min-h-screen bg-black safe-area-black text-white"'}
    )
    "app\privacy\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white"'; new = 'className="min-h-screen bg-black safe-area-black text-white"'}
    )
    "app\gallery\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white selection:bg-white/20"'; new = 'className="min-h-screen bg-black safe-area-black text-white selection:bg-white/20"'}
    )
    "app\faq\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white"'; new = 'className="min-h-screen bg-black safe-area-black text-white"'}
    )
    "app\dashboard\rider\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white selection:bg-primary/30"'; new = 'className="min-h-screen bg-black safe-area-black text-white selection:bg-primary/30"'}
    )
    "app\dashboard\loyalty\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black flex items-center justify-center"'; new = 'className="min-h-screen bg-black safe-area-black flex items-center justify-center"'}
    )
    "app\dashboard\admin\instant-booking\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black flex items-center justify-center"'; new = 'className="min-h-screen bg-black safe-area-black flex items-center justify-center"'}
    )
    "app\contact\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white"'; new = 'className="min-h-screen bg-black safe-area-black text-white"'}
    )
    "app\chat\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white flex items-center'; new = 'className="min-h-screen bg-black safe-area-black text-white flex items-center'},
        @{old = 'className="min-h-screen bg-black text-white flex flex-col"'; new = 'className="min-h-screen bg-black safe-area-black text-white flex flex-col"'}
    )
    "app\booking\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black relative"'; new = 'className="min-h-screen bg-black safe-area-black relative"'}
    )
    "app\about\page.tsx" = @(
        @{old = 'className="min-h-screen bg-black text-white"'; new = 'className="min-h-screen bg-black safe-area-black text-white"'}
    )
    # Gradient pages
    "app\users\[id]\page.tsx" += @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white"'; new = 'className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black safe-area-black text-white"'}
    )
    "app\terms\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black"'; new = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black"'}
    )
    "app\subscriptions\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white"'; new = 'className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black safe-area-black text-white"'}
    )
    "app\signup\page.tsx" += @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black"'; new = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black"'}
    )
    "app\signin\page.tsx" += @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black"'; new = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black"'}
    )
    "app\pricing\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black relative overflow-hidden"'; new = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black relative overflow-hidden"'}
    )
    "app\offline\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex items-center justify-center p-4"'; new = 'className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black safe-area-black flex items-center justify-center p-4"'}
    )
    "app\dashboard\stable\schedule\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 p-4 md:p-8"'; new = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black p-4 md:p-8"'}
    )
    "app\dashboard\stable\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"'; new = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'}
    )
    "app\dashboard\loyalty\page.tsx" += @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6"'; new = 'className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black safe-area-black text-white p-6"'}
    )
    "app\dashboard\analytics\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"'; new = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'}
    )
    "app\dashboard\admin\locations\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"'; new = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'}
    )
    "app\dashboard\admin\instant-booking\page.tsx" += @(
        @{old = 'className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black"'; new = 'className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black safe-area-black"'}
    )
    "app\dashboard\admin\horse-changes\page.tsx" = @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95"'; new = 'className="min-h-screen bg-gradient-to-b from-black/80 via-black/90 to-black/95 safe-area-black"'}
    )
    "app\booking\page.tsx" += @(
        @{old = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black flex items-center justify-center"'; new = 'className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black safe-area-black flex items-center justify-center"'}
    )
}

$baseDir = "C:\Users\Administrator\Desktop\pyraride"
$count = 0

foreach ($file in $updates.Keys) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $changed = $false
        
        foreach ($replacement in $updates[$file]) {
            if ($content -like "*$($replacement.old)*") {
                $content = $content -replace [regex]::Escape($replacement.old), $replacement.new
                $changed = $true
            }
        }
        
        if ($changed) {
            Set-Content $fullPath -Value $content -NoNewline
            Write-Host "✓ Updated: $file" -ForegroundColor Green
            $count++
        }
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Updated $count files" -ForegroundColor Cyan
