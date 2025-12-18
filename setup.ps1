# Universal E-commerce Admin Panel - Quick Setup Script
# This script sets up the development environment

Write-Host "🚀 Universal E-commerce Admin Panel - Setup Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerInstalled) {
    Write-Host "✅ Docker is installed" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host ""
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host ""
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
    docker-compose exec -T backend npm run prisma:migrate -- --name init
    
    Write-Host ""
    Write-Host "🌱 Seeding database with demo data..." -ForegroundColor Yellow
    docker-compose exec -T backend npm run prisma:seed
    
    Write-Host ""
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Your admin panel is ready!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "API URL: http://localhost:3000/api/v1" -ForegroundColor White
    Write-Host "Health Check: http://localhost:3000/api/v1/health" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Default Login Credentials:" -ForegroundColor Yellow
    Write-Host "   Super Admin: admin@example.com / admin123" -ForegroundColor White
    Write-Host "   Store Owner: owner@demostore.com / admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Test API: POST http://localhost:3000/api/v1/auth/login" -ForegroundColor White
    Write-Host "   2. View Database: npm run prisma:studio (in backend folder)" -ForegroundColor White
    Write-Host "   3. Read QUICKSTART.md for more details" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Useful Commands:" -ForegroundColor Yellow
    Write-Host "   docker-compose logs -f backend   # View logs" -ForegroundColor White
    Write-Host "   docker-compose down              # Stop services" -ForegroundColor White
    Write-Host "   docker-compose ps                # Check status" -ForegroundColor White
    
} else {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Manual Setup Required:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Install Node.js 18+" -ForegroundColor White
    Write-Host "2. Install PostgreSQL 15+" -ForegroundColor White
    Write-Host "3. Install Redis 7+" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Run these commands:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host "   cp .env.example .env" -ForegroundColor Gray
    Write-Host "   # Edit .env with your database credentials" -ForegroundColor Gray
    Write-Host "   npm run prisma:generate" -ForegroundColor Gray
    Write-Host "   npm run prisma:migrate" -ForegroundColor Gray
    Write-Host "   npm run prisma:seed" -ForegroundColor Gray
    Write-Host "   npm run start:dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📖 See QUICKSTART.md for detailed instructions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "🎉 Happy Coding!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
