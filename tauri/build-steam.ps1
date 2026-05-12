param (
    [string]$version
)

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($version) {
    Write-Host "Updating version to $version..." -ForegroundColor Cyan
    
    $tauriConfPath = Join-Path $scriptDirectory "src-tauri/tauri.conf.json"
    $cargoTomlPath = Join-Path $scriptDirectory "src-tauri/Cargo.toml"

    (Get-Content $tauriConfPath) -replace '"version": ".*"', "`"version`": `"$version`"" | Set-Content $tauriConfPath
    (Get-Content $cargoTomlPath) -replace '^version = ".*"', "version = `"$version`"" | Set-Content $cargoTomlPath
}

$repositoryDirectory = Resolve-Path (Join-Path $scriptDirectory "..")

Push-Location $repositoryDirectory
npm ci
npm run build-steam
Pop-Location

Push-Location $scriptDirectory
npm ci
npm run tauri build -- --features steam_client
Pop-Location
