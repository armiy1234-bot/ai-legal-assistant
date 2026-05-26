# LexAI Auto-Sync Script
# PowerShell 5.1 compatible

param(
    [switch]$Watch,
    [int]$IntervalSeconds = 60
)

$ErrorActionPreference = "Stop"

function Export-Data {
    $dataFile = Join-Path $PSScriptRoot "users.json"
    
    if (-not (Test-Path $dataFile)) {
        Write-Host "ERROR: users.json not found" -ForegroundColor Red
        return
    }
    
    $json = Get-Content $dataFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $users = $json.users
    
    # Export to Markdown
    $md = @()
    $md += "# LexAI Users"
    $md += ""
    $md += "Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $md += ""
    $md += "Total users: $($users.Count)"
    $md += ""
    
    foreach ($user in $users) {
        $md += "## $($user.name)"
        $md += ""
        $md += "- ID: $($user.id)"
        $md += "- Email: $($user.email)"
        $md += "- Phone: $($user.phone)"
        $md += "- Role: $($user.role)"
        $md += "- Queries: $($user.queriesCount)"
        $md += ""
    }
    
    $mdPath = Join-Path $PSScriptRoot "users.md"
    $md -join "`n" | Set-Content $mdPath -Encoding UTF8
    Write-Host "OK: users.md updated" -ForegroundColor Green
    
    # Export to CSV
    $csvPath = Join-Path $PSScriptRoot "users.csv"
    $users | Select-Object id, name, email, phone, role, queriesCount, createdAt | 
        Export-Csv $csvPath -NoTypeInformation -Encoding UTF8
    Write-Host "OK: users.csv updated" -ForegroundColor Green
    
    # Export to HTML
    $html = @()
    $html += "<html><head><meta charset='UTF-8'><title>LexAI Users</title></head><body>"
    $html += "<h1>LexAI Users</h1>"
    $html += "<p>Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>"
    $html += "<p>Total: $($users.Count)</p>"
    $html += "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr>"
    
    foreach ($user in $users) {
        $html += "<tr><td>$($user.id)</td><td>$($user.name)</td><td>$($user.email)</td><td>$($user.phone)</td><td>$($user.role)</td></tr>"
    }
    
    $html += "</table></body></html>"
    
    $htmlPath = Join-Path $PSScriptRoot "users.html"
    $html -join "`n" | Set-Content $htmlPath -Encoding UTF8
    Write-Host "OK: users.html updated" -ForegroundColor Green
}

# Main
if ($Watch) {
    Write-Host "Watching for changes... Press Ctrl+C to stop" -ForegroundColor Cyan
    while ($true) {
        Export-Data
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Export-Data
    Write-Host "Done!" -ForegroundColor Green
}
