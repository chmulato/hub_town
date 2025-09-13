# start.ps1
# Script para inicializar o Hub Central de Pedidos v2.0
# Executa no Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Hub Central de Pedidos v2.0" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se a porta está sendo usada
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
    Write-Host "❌ Erro: Diretório back-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Erro: Diretório front-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $backendPackageFile)) {
    Write-Host "❌ Erro: package.json do back-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPackageFile)) {
    Write-Host "❌ Erro: package.json do front-end não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Estrutura do projeto verificada" -ForegroundColor Green

# Detectar configurações
$backendPort = Get-BackendPort -ConfigFilePath $configFile
$frontendPort = 5173

Write-Host ""
Write-Host "Configurações detectadas:" -ForegroundColor Cyan
Write-Host "  📡 Back-end API: http://localhost:$backendPort" -ForegroundColor Gray
Write-Host "  🌐 Front-end: http://localhost:$frontendPort" -ForegroundColor Gray
Write-Host "  📚 Swagger UI: http://localhost:$backendPort/api/swagger" -ForegroundColor Gray

Write-Host ""
Write-Host "Verificando dependências..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Instalar dependências do back-end se necessário
if (-not (Test-Path "$backendDir\node_modules")) {
    Write-Host "📦 Instalando dependências do back-end..." -ForegroundColor Yellow
    Set-Location $backendDir
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências do back-end" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependências do back-end instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependências do back-end já instaladas" -ForegroundColor Green
}

# Instalar dependências do front-end se necessário
if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "📦 Instalando dependências do front-end..." -ForegroundColor Yellow
    Set-Location $frontendDir
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências do front-end" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependências do front-end instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependências do front-end já instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "Preparando inicialização dos serviços..." -ForegroundColor Yellow

# Limpar portas se estiverem em uso
if (Test-Port $backendPort) {
    Write-Host "⚠️  Porta $backendPort já está em uso - tentando liberar..." -ForegroundColor Yellow
    Stop-ProcessOnPort $backendPort
    Start-Sleep -Seconds 2
}

if (Test-Port $frontendPort) {
    Write-Host "⚠️  Porta $frontendPort já está em uso - tentando liberar..." -ForegroundColor Yellow
    Stop-ProcessOnPort $frontendPort
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Green

# Iniciar o back-end em background
Write-Host "🔧 Iniciando API back-end (porta $backendPort)..." -ForegroundColor Cyan
Set-Location $backendDir

# Criar job para o back-end
$backendJob = Start-Job -ScriptBlock {
    param($dir, $port)
    Set-Location $dir
    $env:PORT = $port
    npm start
} -ArgumentList $backendDir, $backendPort

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
    Write-Host "✅ Back-end API iniciado com sucesso!" -ForegroundColor Green
    Write-Host "   📡 API: http://localhost:$backendPort" -ForegroundColor Gray
    Write-Host "   📚 Docs: http://localhost:$backendPort/api/swagger" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Back-end ainda inicializando... (continuando)" -ForegroundColor Yellow
}

Write-Host ""

# Iniciar o front-end
Write-Host "🌐 Iniciando interface front-end (porta $frontendPort)..." -ForegroundColor Cyan
Set-Location $frontendDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   🎉 Hub Central v2.0 INICIADO! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Aplicação Web: http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host "🔧 API Backend: http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host "📚 Documentação: http://localhost:$backendPort/api/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "Funcionalidades disponíveis:" -ForegroundColor Yellow
Write-Host "  🛒 3 Marketplaces integrados (Shopee, Mercado Livre, Shein)" -ForegroundColor Gray
Write-Host "  📊 60 pedidos mockados para teste" -ForegroundColor Gray
Write-Host "  🔍 Sistema de busca unificada" -ForegroundColor Gray
Write-Host "  📑 Interface com abas organizadas" -ForegroundColor Gray
Write-Host "  ⚙️  Configuração de APIs e autenticação" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar todos os serviços" -ForegroundColor Yellow
Write-Host ""

# Executar o front-end (este ficará no terminal principal)
try {
    # Usar 'dev' ao invés de 'start' pois é o comando correto do Vite
    npm run dev
}
finally {
    # Limpar recursos quando o script terminar
    Write-Host ""
    Write-Host "🛑 Parando serviços..." -ForegroundColor Yellow
    
    if ($backendJob) {
        Write-Host "   Finalizando back-end..." -ForegroundColor Gray
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
    
    # Tentar limpar as portas novamente
    Stop-ProcessOnPort $backendPort
    Stop-ProcessOnPort $frontendPort
    
    Write-Host ""
    Write-Host "✅ Hub Central v2.0 finalizado com sucesso!" -ForegroundColor Green
    Write-Host "   Obrigado por usar o Hub Central! 👋" -ForegroundColor Cyan
}


