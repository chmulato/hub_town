# setup-database.ps1 - Script completo para configurar o PostgreSQL

Write-Host "Configurando PostgreSQL para o HUB de Entregas..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker está instalado
try {
    docker --version | Out-Null
    Write-Host "Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Docker não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "   Instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar se docker-compose.yml existe
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERRO: Arquivo docker-compose.yml não encontrado" -ForegroundColor Red
    exit 1
}

# Parar containers existentes (se houver)
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

# Subir PostgreSQL
Write-Host "Iniciando PostgreSQL..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao iniciar PostgreSQL" -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL iniciado com sucesso!" -ForegroundColor Green

# Aguardar PostgreSQL estar pronto
Write-Host "Aguardando PostgreSQL estar pronto..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 30

do {
    $ready = docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db 2>$null
    if ($LASTEXITCODE -eq 0) {
        break
    }
    $attempts++
    if ($attempts -ge $maxAttempts) {
        Write-Host "ERRO: Timeout aguardando PostgreSQL" -ForegroundColor Red
        exit 1
    }
    Write-Host "   Tentativa $attempts/$maxAttempts..." -ForegroundColor Gray
    Start-Sleep -Seconds 2
} while ($true)

Write-Host "PostgreSQL está pronto!" -ForegroundColor Green

# Executar scripts de inicialização
Write-Host "Executando script de inicialização..." -ForegroundColor Cyan
& "./database/init-db.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha na inicialização do banco" -ForegroundColor Red
    exit 1
}

# Instalar dependências do Node.js (se necessário)
Write-Host "Verificando dependências do Node.js..." -ForegroundColor Cyan
Push-Location "back-end"

if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependências..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ERRO: Falha ao instalar dependências" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Write-Host "   Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "   Dependências já instaladas" -ForegroundColor Green
}

# Criar arquivo .env se não existir
if (-not (Test-Path ".env")) {
    Write-Host "Criando arquivo .env..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "   Arquivo .env criado baseado no .env.example" -ForegroundColor Green
}

# Migrar dados dos JSONs
Write-Host "Migrando dados dos JSONs para PostgreSQL..." -ForegroundColor Cyan
node migrate-json-data.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "   AVISO: Erro na migração, mas continuando..." -ForegroundColor Yellow
} else {
    Write-Host "   Dados migrados com sucesso" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "Setup completo!" -ForegroundColor Green
Write-Host ""
Write-Host "Informações de conexão:" -ForegroundColor White
Write-Host "   Host: localhost" -ForegroundColor Gray
Write-Host "   Porta: 5432" -ForegroundColor Gray
Write-Host "   Banco: hubtown_db" -ForegroundColor Gray
Write-Host "   Usuário: hubtown_user" -ForegroundColor Gray
Write-Host "   Senha: hubtown_pass" -ForegroundColor Gray
Write-Host ""
Write-Host "Para iniciar o backend:" -ForegroundColor White
Write-Host "   cd back-end" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "Para acessar o banco via psql:" -ForegroundColor White
Write-Host "   docker exec -it hubtown_postgres psql -U hubtown_user -d hubtown_db" -ForegroundColor Gray
Write-Host ""
Write-Host "Swagger UI estará disponível em:" -ForegroundColor White
Write-Host "   http://localhost:3001/api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentação completa em: doc/DATABASE_SETUP.md" -ForegroundColor White