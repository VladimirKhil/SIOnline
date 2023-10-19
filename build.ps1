param (
    [string]$tag = "latest"
)

npm install
npm run build-prod
Copy-Item ./assets/manifest/*.png ./dist
docker build . -t vladimirkhil/sionline:$tag