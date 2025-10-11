# Community Connect - Easy Start Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting Community Connect..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies (if needed)..." -ForegroundColor Cyan
Write-Host ""

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
if (!(Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "✅ Server dependencies already installed" -ForegroundColor Green
}
Set-Location ..

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
if (!(Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "✅ Client dependencies already installed" -ForegroundColor Green
}
Set-Location ..

Write-Host ""
Write-Host "🎯 Starting servers..." -ForegroundColor Green
Write-Host ""

# Start backend in demo mode in background
Write-Host "Starting backend server (Demo Mode - No Database Required)..." -ForegroundColor Cyan
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run demo" -PassThru

Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "Starting frontend server..." -ForegroundColor Cyan
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm start" -PassThru

Write-Host ""
Write-Host "✅ Servers starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Important Information:" -ForegroundColor Yellow
Write-Host "   - Backend: http://localhost:5000/api" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Your browser will open automatically" -ForegroundColor White
Write-Host ""
Write-Host "👤 Demo Login Credentials:" -ForegroundColor Yellow
Write-Host "   Email:    admin@demo.com" -ForegroundColor White
Write-Host "   Password: demo123" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  To stop servers, close the PowerShell windows or press Ctrl+C" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
