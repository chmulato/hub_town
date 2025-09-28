# Script PowerShell para inicializar o banco PostgreSQL do HUB

Write-Host "Inicializando banco PostgreSQL do HUB de Entregas..." -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker ps | Out-Null
} catch {
    Write-Host "ERRO: Docker não está rodando. Execute 'docker-compose up -d' primeiro." -ForegroundColor Red
    exit 1
}

# Aguardar o PostgreSQL estar pronto
Write-Host "Aguardando PostgreSQL estar pronto..." -ForegroundColor Yellow
do {
    $ready = docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   PostgreSQL ainda não está pronto. Aguardando..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($LASTEXITCODE -ne 0)

Write-Host "PostgreSQL está pronto!" -ForegroundColor Green

# Executar o schema
Write-Host "Criando tabelas..." -ForegroundColor Cyan
Get-Content "database/schema.sql" | docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "Tabelas criadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "ERRO: Falha ao criar tabelas." -ForegroundColor Red
    exit 1
}

# Executar os seeds
Write-Host "Inserindo dados iniciais..." -ForegroundColor Cyan
Get-Content "database/seeds.sql" | docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dados iniciais inseridos com sucesso!" -ForegroundColor Green
} else {
    Write-Host "ERRO: Falha ao inserir dados iniciais." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Banco inicializado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Informações de conexão:" -ForegroundColor White
Write-Host "   Host: localhost" -ForegroundColor Gray
Write-Host "   Porta: 5432" -ForegroundColor Gray
Write-Host "   Banco: hubtown_db" -ForegroundColor Gray
Write-Host "   Usuário: hubtown_user" -ForegroundColor Gray
Write-Host "   Senha: hubtown_pass" -ForegroundColor Gray
Write-Host ""
Write-Host "Para conectar via psql:" -ForegroundColor White
Write-Host "   docker exec -it hubtown_postgres psql -U hubtown_user -d hubtown_db" -ForegroundColor Gray