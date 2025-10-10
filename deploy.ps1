# Community Connect - Quick Deploy Script

Write-Host "🚀 Community Connect Deployment Setup" -ForegroundColor Cyan

# Step 1: Initialize Git Repository
Write-Host "`n📂 Initializing Git Repository..." -ForegroundColor Yellow
if (!(Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial Community Connect deployment"
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Git repository already exists" -ForegroundColor Blue
}

# Step 2: Install Vercel CLI if not exists
Write-Host "`n📦 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI already installed" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Step 3: Build Frontend
Write-Host "`n🔨 Building Frontend..." -ForegroundColor Yellow
Set-Location "client"
npm run build
Set-Location ".."
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 4: Display Next Steps
Write-Host "`n🌐 Next Steps for Deployment:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository and push code:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/yourusername/community-connect.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray

Write-Host "`n2. Deploy Backend to Railway:" -ForegroundColor White
Write-Host "   - Go to https://railway.app" -ForegroundColor Gray
Write-Host "   - Connect your GitHub repo" -ForegroundColor Gray
Write-Host "   - Deploy from server folder" -ForegroundColor Gray
Write-Host "   - Add environment variables (MongoDB, JWT_SECRET)" -ForegroundColor Gray

Write-Host "`n3. Deploy Frontend to Vercel:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   vercel" -ForegroundColor Gray

Write-Host "`n4. Update .env.production with your Railway backend URL" -ForegroundColor White

Write-Host "`n🎉 Your app will be live and accessible worldwide!" -ForegroundColor Green