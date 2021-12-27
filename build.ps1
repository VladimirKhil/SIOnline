param (
    [string]$tag = "latest"
)

npm install
npm run build-prod
docker build . -t vladimirkhil/sionline:$tag