$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryDirectory = Resolve-Path (Join-Path $scriptDirectory "..")

Push-Location $repositoryDirectory
npm install
npm run build-steam
Pop-Location

Push-Location $scriptDirectory
npm install
npm run tauri build -- --features steam_client
Pop-Location
