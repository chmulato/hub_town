# start.ps1
# Script para inicializar o Hub Central de Pedidos v2.0
# Executa no Windows PowerShell com PostgreSQL + RabbitMQ

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Hub Central de Pedidos v2.0" -ForegroundColor Green
Write-Host "    Com PostgreSQL + RabbitMQ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "  Docker: Instalado" -ForegroundColor Green
} catch {
    Write-Host "  Docker: NAO ENCONTRADO" -ForegroundColor Red
    Write-Host "  Instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar se Node.js esta instalado
try {
    node --version | Out-Null
    Write-Host "  Node.js: Instalado" -ForegroundColor Green
} catch {
    Write-Host "  Node.js: NAO ENCONTRADO" -ForegroundColor Red
    Write-Host "  Instale o Node.js: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Funcao para verificar se a porta esta sendo usada
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Funcao para verificar se PostgreSQL esta pronto
function Test-PostgreSQL {
    try {
        $result = docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db 2>$null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Funcao para verificar se RabbitMQ esta pronto
function Test-RabbitMQ {
    try {
        docker exec hubtown_rabbitmq rabbitmq-diagnostics -q ping 2>$null | Out-Null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Funcao para configurar banco de dados PostgreSQL
function Setup-Database {
    Write-Host "Configurando serviços: PostgreSQL e RabbitMQ..." -ForegroundColor Cyan
    
    # Verificar se docker-compose.yml existe
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Host "  ERRO: docker-compose.yml nao encontrado" -ForegroundColor Red
        return $false
    }
    
    # Parar containers existentes
    Write-Host "  Parando containers existentes..." -ForegroundColor Yellow
    docker-compose down 2>$null | Out-Null
    
    # Iniciar serviços do docker-compose (PostgreSQL + RabbitMQ)
    Write-Host "  Iniciando serviços (docker-compose up -d)..." -ForegroundColor Green
    docker-compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERRO: Falha ao iniciar serviços" -ForegroundColor Red
        return $false
    }
    
    # Aguardar PostgreSQL estar pronto
    Write-Host "  Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
    $attempts = 0
    $maxAttempts = 30
    
    do {
        if (Test-PostgreSQL) {
            break
        }
        $attempts++
        if ($attempts -ge $maxAttempts) {
            Write-Host "  ERRO: Timeout aguardando PostgreSQL" -ForegroundColor Red
            return $false
        }
        Start-Sleep -Seconds 2
    } while ($true)
    
    Write-Host "  PostgreSQL esta pronto!" -ForegroundColor Green

    # Aguardar RabbitMQ estar pronto
    Write-Host "  Aguardando RabbitMQ ficar pronto..." -ForegroundColor Yellow
    $attempts = 0
    do {
        if (Test-RabbitMQ) {
            break
        }
        $attempts++
        if ($attempts -ge $maxAttempts) {
            Write-Host "  AVISO: Timeout aguardando RabbitMQ (continuando mesmo assim)" -ForegroundColor Yellow
            break
        }
        Start-Sleep -Seconds 2
    } while ($true)
    if (Test-RabbitMQ) {
        Write-Host "  RabbitMQ esta pronto!" -ForegroundColor Green
    }

    # Executar scripts de inicializacao
    Write-Host "  Executando scripts de inicializacao do banco..." -ForegroundColor Green    # Criar tabelas
    Get-Content "database/schema.sql" | docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERRO: Falha ao criar tabelas" -ForegroundColor Red
        return $false
    }
    
    # Inserir dados iniciais
    Get-Content "database/seeds.sql" | docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERRO: Falha ao inserir dados iniciais" -ForegroundColor Red
        return $false
    }
    
    Write-Host "  Banco configurado com sucesso!" -ForegroundColor Green
    return $true
}

# Funcao para migrar dados dos JSONs
function Migrate-JSONData {
    Write-Host "Migrando dados dos marketplaces..." -ForegroundColor Cyan
    
    Push-Location "back-end"
    
    # Verificar se arquivo de migração existe
    if (-not (Test-Path "migrate-json-data.js")) {
        Write-Host "  Criando script de migração..." -ForegroundColor Yellow
        
        # Criar script de migração dos dados JSON
        $migrationScript = @'
// migrate-json-data.js - Migração dos dados JSON para PostgreSQL
import { initDatabase, query, transaction } from './config/database.js';
import fs from 'fs';
import path from 'path';

const marketplaceMap = {
    'Shopee': 1,
    'Mercado Livre': 2,
    'Shein': 3
};

const statusMap = {
    'READY_TO_SHIP': 'ready_to_ship',
    'WAITING_PICKUP': 'waiting_pickup',
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled'
};

async function parseAddress(addressString) {
    // Parse do endereço brasileiro
    const parts = addressString.split(' - ');
    if (parts.length >= 3) {
        const street = parts[0].trim();
        const neighborhood = parts[1].trim();
        const cityState = parts[2].trim();
        const [city, state] = cityState.split('/');
        
        return {
            street: street.replace(/,\s*\d+$/, ''),
            number: street.match(/,\s*(\d+)$/) ? street.match(/,\s*(\d+)$/)[1] : 'S/N',
            neighborhood: neighborhood,
            city: city ? city.trim() : 'Cidade',
            state: state ? state.trim() : 'SP',
            zip_code: '00000-000'
        };
    }
    
    return {
        street: addressString,
        number: 'S/N',
        neighborhood: 'Centro',
        city: 'Cidade',
        state: 'SP',
        zip_code: '00000-000'
    };
}

async function insertAddress(addressData) {
    const existingAddress = await query(
        `SELECT id FROM addresses WHERE street = $1 AND number = $2 AND neighborhood = $3 AND city = $4`,
        [addressData.street, addressData.number, addressData.neighborhood, addressData.city]
    );
    
    if (existingAddress.rows.length > 0) {
        return existingAddress.rows[0].id;
    }
    
    const result = await query(
        `INSERT INTO addresses (street, number, neighborhood, city, state, zip_code)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [addressData.street, addressData.number, addressData.neighborhood, addressData.city, addressData.state, addressData.zip_code]
    );
    
    return result.rows[0].id;
}

async function insertBuyer(buyerName, contact, addressId) {
    const existingBuyer = await query(
        `SELECT id FROM buyers WHERE name = $1 AND address_id = $2`,
        [buyerName, addressId]
    );
    
    if (existingBuyer.rows.length > 0) {
        return existingBuyer.rows[0].id;
    }
    
    const result = await query(
        `INSERT INTO buyers (name, contact, address_id)
         VALUES ($1, $2, $3) RETURNING id`,
        [buyerName, contact || '+55 11 90000-0000', addressId]
    );
    
    return result.rows[0].id;
}

async function migrateMarketplaceData(marketplace, filePath) {
    console.log(`Migrando dados do ${marketplace}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  Arquivo não encontrado: ${filePath}`);
        return 0;
    }
    
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let migratedCount = 0;
    
    for (const order of jsonData) {
        try {
            // Parse do endereço
            const addressData = await parseAddress(order.address || '');
            const addressId = await insertAddress(addressData);
            
            // Inserir comprador
            const buyerId = await insertBuyer(order.buyer, order.contact, addressId);
            
            // Inserir pedido
            const marketplaceId = marketplaceMap[marketplace];
            const orderStatus = statusMap[order.status] || 'pending';
            
            await query(
                `INSERT INTO orders (
                    marketplace_id, original_order_id, buyer_id, product_name,
                    quantity, order_status, source_api, consent_given, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    marketplaceId,
                    order.orderId,
                    buyerId,
                    order.product,
                    order.quantity || 1,
                    orderStatus,
                    marketplace.toLowerCase().replace(' ', ''),
                    true,
                    new Date(order.orderDate || Date.now())
                ]
            );
            
            migratedCount++;
        } catch (error) {
            console.error(`  Erro ao migrar pedido ${order.orderId}:`, error.message);
        }
    }
    
    console.log(`  ${migratedCount} pedidos migrados do ${marketplace}`);
    return migratedCount;
}

async function main() {
    try {
        console.log('Iniciando migração dos dados JSON...');
        
        initDatabase();
        
        let totalMigrated = 0;
        
        // Migrar dados de cada marketplace
        totalMigrated += await migrateMarketplaceData('Shopee', 'data/shopee-orders.json');
        totalMigrated += await migrateMarketplaceData('Mercado Livre', 'data/mercadolivre-orders.json');
        totalMigrated += await migrateMarketplaceData('Shein', 'data/shein-orders.json');
        
        console.log(`\nMigração concluída! Total: ${totalMigrated} pedidos migrados.`);
        
        // Mostrar estatísticas
        const stats = await query(`
            SELECT m.name as marketplace, COUNT(*) as total
            FROM orders o
            JOIN marketplaces m ON o.marketplace_id = m.id
            GROUP BY m.name
            ORDER BY total DESC
        `);
        
        console.log('\nEstatísticas por marketplace:');
        for (const row of stats.rows) {
            console.log(`  ${row.marketplace}: ${row.total} pedidos`);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('Erro na migração:', error);
        process.exit(1);
    }
}

main();
'@
        
        $migrationScript | Out-File -FilePath "migrate-json-data.js" -Encoding UTF8
    }
    
    # Executar migração
    node migrate-json-data.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Dados dos marketplaces migrados com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "  AVISO: Erro na migração, mas continuando..." -ForegroundColor Yellow
    }
    
    Pop-Location
}

# Função para detectar porta do back-end (do config.js)
function Get-BackendPort {
    param([string]$ConfigFilePath)
    
    # Primeiro tenta variável de ambiente
    if ($env:PORT) {
        return [int]$env:PORT
    }
    
    # Verifica o arquivo de config
    if (Test-Path $ConfigFilePath) {
        $content = Get-Content $ConfigFilePath -Raw
        if ($content -match 'port:\s*process\.env\.PORT\s*\|\|\s*(\d+)') {
            $port = [int]$matches[1]
            Write-Host "Porta detectada no config: $port" -ForegroundColor Green
            return $port
        }
    }
    
    Write-Host "Usando porta padrão: 3001" -ForegroundColor Yellow
    return 3001
}

# Função para matar processos nas portas
function Stop-ProcessOnPort {
    param([int]$Port)
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($processId in $processes) {
            if ($processId -and $processId -ne 0) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Finalizando processo na porta $Port (PID: $processId)" -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    }
    catch {
        # Silenciar erros se não conseguir matar o processo
    }
}



# Diretórios e arquivos
$backendDir = Join-Path $PSScriptRoot "back-end"
$frontendDir = Join-Path $PSScriptRoot "front-end"
$configFile = Join-Path $backendDir "config\config.js"
$backendPackageFile = Join-Path $backendDir "package.json"
$frontendPackageFile = Join-Path $frontendDir "package.json"

# Verificar estrutura do projeto
Write-Host "Verificando estrutura do projeto..." -ForegroundColor Yellow

if (-not (Test-Path $backendDir)) {
    Write-Host "ERRO: Diretório back-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "ERRO: Diretório front-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendPackageFile)) {
    Write-Host "ERRO: package.json do back-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPackageFile)) {
    Write-Host "ERRO: package.json do front-end não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Estrutura do projeto verificada" -ForegroundColor Green

Write-Host ""
# CONFIGURAÇÃO DO BANCO POSTGRESQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Configurando PostgreSQL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$databaseConfigured = Setup-Database
if (-not $databaseConfigured) {
    Write-Host "ERRO: Falha na configuração do PostgreSQL" -ForegroundColor Red
    Write-Host "Verifique se o Docker está rodando e tente novamente." -ForegroundColor Yellow
    exit 1
}

# Migrar dados dos JSONs
Migrate-JSONData

Write-Host ""
Write-Host "PostgreSQL configurado e dados migrados!" -ForegroundColor Green
Write-Host "  Host: localhost:5432" -ForegroundColor Gray
Write-Host "  Banco: hubtown_db" -ForegroundColor Gray
Write-Host "  Usuario: hubtown_user" -ForegroundColor Gray
if (Test-RabbitMQ) {
    Write-Host "  RabbitMQ UI: http://localhost:15672 (hubtown_user / hubtown_pass)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Iniciando Aplicacao" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Detectar configuracoes
$backendPort = Get-BackendPort -ConfigFilePath $configFile
$frontendPort = 5173
${null} = $frontendPort # evitar aviso em algumas versões do PowerShell

# Definir fonte de dados padrão para o backend (DB)
$dataSource = 'db'
$env:DATA_SOURCE = $dataSource

Write-Host ""
Write-Host "Configuracoes detectadas:" -ForegroundColor Cyan
Write-Host "  Back-end API: http://localhost:$backendPort" -ForegroundColor Gray
Write-Host "  Front-end: http://localhost:$frontendPort" -ForegroundColor Gray
Write-Host "  Swagger UI: http://localhost:$backendPort/api/swagger" -ForegroundColor Gray
Write-Host "  Data Source (API): $dataSource" -ForegroundColor Gray

Write-Host ""
Write-Host "Verificando dependências..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Instalar dependencias do back-end se necessario
if (-not (Test-Path "$backendDir\node_modules")) {
    Write-Host "Instalando dependencias do back-end..." -ForegroundColor Yellow
    Set-Location $backendDir
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao instalar dependencias do back-end" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencias do back-end instaladas" -ForegroundColor Green
} else {
    Write-Host "Dependencias do back-end ja instaladas" -ForegroundColor Green
}

# Instalar dependencias do front-end se necessario
if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "Instalando dependencias do front-end..." -ForegroundColor Yellow
    Set-Location $frontendDir
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: Falha ao instalar dependencias do front-end" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencias do front-end instaladas" -ForegroundColor Green
} else {
    Write-Host "Dependencias do front-end ja instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "Preparando inicializacao dos servicos..." -ForegroundColor Yellow

# Limpar portas se estiverem em uso
if (Test-Port $backendPort) {
    Write-Host "AVISO: Porta $backendPort já está em uso - tentando liberar..." -ForegroundColor Yellow
    Stop-ProcessOnPort $backendPort
    Start-Sleep -Seconds 2
}

if (Test-Port $frontendPort) {
    Write-Host "AVISO: Porta $frontendPort já está em uso - tentando liberar..." -ForegroundColor Yellow
    Stop-ProcessOnPort $frontendPort
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Iniciando servicos..." -ForegroundColor Green

# Iniciar o back-end em background
Write-Host "Iniciando API back-end (porta $backendPort)..." -ForegroundColor Cyan
Set-Location $backendDir

# Criar job para o back-end
$backendJob = Start-Job -ScriptBlock {
    param($dir, $port, $ds)
    Set-Location $dir
    $env:PORT = $port
    $env:DATA_SOURCE = $ds
    npm start
} -ArgumentList $backendDir, $backendPort, $dataSource

# Aguardar inicialização do back-end
Write-Host "   Aguardando inicialização..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Verificar se o back-end está respondendo
$backendReady = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$backendPort/api/info" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # Continuar tentando
    }
    Start-Sleep -Seconds 1
}

if ($backendReady) {
    Write-Host "Back-end API iniciado com sucesso!" -ForegroundColor Green
    Write-Host "   API: http://localhost:$backendPort" -ForegroundColor Gray
    Write-Host "   Docs: http://localhost:$backendPort/api/swagger" -ForegroundColor Gray
} else {
    Write-Host "AVISO: Back-end ainda inicializando... (continuando)" -ForegroundColor Yellow
}

Write-Host ""

# Iniciar o front-end
Write-Host "Iniciando interface front-end (porta $frontendPort)..." -ForegroundColor Cyan
Set-Location $frontendDir

# Definir base da API para o frontend (Vite)
$env:VITE_API_BASE_URL = "http://localhost:$backendPort/api"
Write-Host "  VITE_API_BASE_URL: $env:VITE_API_BASE_URL" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Hub Central v2.0 INICIADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aplicacao Web: http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host "API Backend: http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host "Swagger UI: http://localhost:$backendPort/api/swagger" -ForegroundColor Cyan
Write-Host "RabbitMQ UI: http://localhost:15672 (hubtown_user / hubtown_pass)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Funcionalidades disponiveis:" -ForegroundColor Yellow
Write-Host "  3 Marketplaces integrados (Shopee, Mercado Livre, Shein)" -ForegroundColor Gray
Write-Host "  60 pedidos mockados para teste" -ForegroundColor Gray
Write-Host "  Sistema de busca unificada" -ForegroundColor Gray
Write-Host "  Interface com abas organizadas" -ForegroundColor Gray
Write-Host "  Configuracao de APIs e autenticacao" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione Ctrl+C para parar todos os servicos" -ForegroundColor Yellow
Write-Host ""

# Executar o front-end (este ficará no terminal principal)
try {
    # Usar 'dev' ao invés de 'start' pois é o comando correto do Vite
    npm run dev
}
finally {
    # Limpar recursos quando o script terminar
    Write-Host ""
    Write-Host "Parando servicos..." -ForegroundColor Yellow
    
    if ($backendJob) {
        Write-Host "   Finalizando back-end..." -ForegroundColor Gray
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
    
    # Tentar limpar as portas novamente
    Stop-ProcessOnPort $backendPort
    Stop-ProcessOnPort $frontendPort
    
    Write-Host ""
    Write-Host "Hub Central v2.0 finalizado com sucesso!" -ForegroundColor Green
    Write-Host "   Obrigado por usar o Hub Central!" -ForegroundColor Cyan
}


