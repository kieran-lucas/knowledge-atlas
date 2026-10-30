param([switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
Push-Location $workspace
try {
    if (-not $SkipBuild) {
        & pnpm desktop:build
        if ($LASTEXITCODE -ne 0) { throw 'Desktop build failed.' }
    }
    $binary = Join-Path $workspace 'src-tauri\target\release\knowledge-atlas.exe'
    if (-not (Test-Path -LiteralPath $binary)) { throw "Missing desktop executable: $binary" }
    $desktop = [Environment]::GetFolderPath('Desktop')
    $destination = Join-Path $desktop 'Knowledge Atlas.exe'
    if (Test-Path -LiteralPath $destination) {
        $oldHash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
        $newHash = (Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash
        if ($oldHash -ne $newHash) {
            $backupDirectory = Join-Path $workspace 'desktop-backups'
            New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
            $backup = Join-Path $backupDirectory ('Knowledge Atlas-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.exe')
            Copy-Item -LiteralPath $destination -Destination $backup
        }
    }
    Copy-Item -LiteralPath $binary -Destination $destination -Force
    $artifact = Get-Item -LiteralPath $destination
    $info = [ordered]@{
        product = 'Knowledge Atlas'; version = '1.0.0'; path = $artifact.FullName
        bytes = $artifact.Length; sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
        publishedAt = (Get-Date).ToUniversalTime().ToString('o')
    }
    $info | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $workspace 'docs\desktop-artifact.json') -Encoding UTF8
    Write-Output "Desktop app: $destination"
    Write-Output "Size: $([math]::Round($artifact.Length / 1MB, 2)) MB"
} finally { Pop-Location }
