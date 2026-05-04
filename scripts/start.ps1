Set-StrictMode -Version Latest
$scriptDir = Split-Path $MyInvocation.MyCommand.Path
Push-Location (Join-Path $scriptDir "..")
docker compose up --build -d
Write-Output "Backend started at http://localhost:8000"
Pop-Location
