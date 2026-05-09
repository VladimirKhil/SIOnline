$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryDirectory = Resolve-Path (Join-Path $scriptDirectory "..")

Push-Location $repositoryDirectory
npm ci
npm run build-steam
Pop-Location

Push-Location $scriptDirectory
npm ci
npm run tauri build -- --features steam_client
Pop-Location
