param (
    [string]$version,
    [switch]$debug
)

Set-StrictMode -Version Latest

function Invoke-NpmCommand {
    param (
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$StepName
    )

    & npm @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "$StepName failed with exit code $LASTEXITCODE."
    }
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$buildProfile = if ($debug) { "debug" } else { "release" }
$dllSourceDirectory = Join-Path $scriptDirectory "dlls"
$targetDirectory = Join-Path $scriptDirectory "src-tauri/target/$buildProfile"
$webDistDirectory = Join-Path $scriptDirectory "../dist"

if ($version) {
    Write-Host "Updating version to $version..." -ForegroundColor Cyan
    
    $tauriConfPath = Join-Path $scriptDirectory "src-tauri/tauri.conf.json"
    $cargoTomlPath = Join-Path $scriptDirectory "src-tauri/Cargo.toml"

    (Get-Content $tauriConfPath) -replace '"version": ".*"', "`"version`": `"$version`"" | Set-Content $tauriConfPath
    (Get-Content $cargoTomlPath) -replace '^version = ".*"', "version = `"$version`"" | Set-Content $cargoTomlPath
}

$repositoryDirectory = Resolve-Path (Join-Path $scriptDirectory "..")

Push-Location $repositoryDirectory
Invoke-NpmCommand -Arguments @("install") -StepName "Root npm install"
Invoke-NpmCommand -Arguments @("run", "build-steam") -StepName "Root npm run build-steam"

if (-not (Test-Path $webDistDirectory) -or -not (Get-ChildItem -Path $webDistDirectory -Force | Select-Object -First 1)) {
    throw "Root web build completed without producing files in '$webDistDirectory'."
}

Pop-Location

Push-Location $scriptDirectory
Invoke-NpmCommand -Arguments @("install") -StepName "Tauri npm install"

$tauriBuildArguments = @("run", "tauri", "build", "--", "--features", "steam_client")

if ($debug) {
    $tauriBuildArguments += "--debug"
}

Invoke-NpmCommand -Arguments $tauriBuildArguments -StepName "Tauri build"

if (Test-Path $dllSourceDirectory) {
    New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    Copy-Item -Path (Join-Path $dllSourceDirectory "*") -Destination $targetDirectory -Recurse -Force
}

Pop-Location
