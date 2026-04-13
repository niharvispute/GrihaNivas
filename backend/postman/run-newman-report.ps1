$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$reportsDir = Join-Path $scriptDir 'reports'

if (-not (Test-Path $reportsDir)) {
  New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

$collection = Join-Path $scriptDir 'Bricks_API_EdgeCases.postman_collection.json'
$environment = Join-Path $scriptDir 'Bricks_Local.postman_environment.json'
$jsonReport = Join-Path $reportsDir 'newman-report.json'
$junitReport = Join-Path $reportsDir 'newman-report.xml'
$htmlReport = Join-Path $reportsDir 'newman-report.html'

npx --yes -p newman -p newman-reporter-htmlextra newman run $collection `
  -e $environment `
  --reporters cli,json,junit,htmlextra `
  --reporter-json-export $jsonReport `
  --reporter-junit-export $junitReport `
  --reporter-htmlextra-export $htmlReport `
  --timeout-request 20000 `
  --delay-request 100

Write-Host "Reports generated in: $reportsDir"
