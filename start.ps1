# Scri# Função par# Função para verificar se a porta está sendo usada
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

# Função para extrair a porta do código do back-end
function Get-BackendPort {
    param([string]$ServerFilePath)
    
    if (-not (Test-Path $ServerFilePath)) {
        Write-Host "Arquivo server.js não encontrado" -ForegroundColor Red
        return 3000  # porta padrão
    }
    
    $content = Get-Content $ServerFilePath -Raw
    
    # Procurar por diferentes padrões de definição de porta
    $patterns = @(
        'const\s+PORT\s*=\s*(\d+)',
        'let\s+PORT\s*=\s*(\d+)',
        'var\s+PORT\s*=\s*(\d+)',
        'PORT\s*=\s*(\d+)',
        '\.listen\s*\(\s*(\d+)',
        'process\.env\.PORT\s*\|\|\s*(\d+)'
    )
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $port = [int]$matches[1]
            Write-Host "Porta detectada no código: $port" -ForegroundColor Green
            return $port
        }
    }
    
    Write-Host "Porta não detectada, usando padrão 3000" -ForegroundColor Yellow
    return 3000
}e a porta está sendo usada
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}ização do Hub - Back-end Mock + Front-end React
# Executa no Windows PowerShell

Write-Host "Iniciando o projeto Hub..." -ForegroundColor Green
Write-Host ""

# Função para verificar se uma porta está em uso
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

# Diretórios
$backendDir = Join-Path $PSScriptRoot "back-end"
$frontendDir = Join-Path $PSScriptRoot "front-end"
$serverFile = Join-Path $backendDir "server.js"

# Verificar se os diretórios existem
if (-not (Test-Path $backendDir)) {
    Write-Host "Erro: Diretório back-end não encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "Erro: Diretório front-end não encontrado" -ForegroundColor Red
    exit 1
}

# Detectar a porta do back-end automaticamente
$backendPort = Get-BackendPort -ServerFilePath $serverFile
Write-Host "Back-end configurado para porta: $backendPort" -ForegroundColor Cyan

Write-Host ""
Write-Host "Verificando dependências..." -ForegroundColor Yellow

# Instalar dependências do back-end se necessário
if (-not (Test-Path "$backendDir\node_modules")) {
    Write-Host "Instalando dependências do back-end..." -ForegroundColor Yellow
    Set-Location $backendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao instalar dependências do back-end" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependências do back-end instaladas" -ForegroundColor Green
}

# Instalar dependências do front-end se necessário
if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "Instalando dependências do front-end..." -ForegroundColor Yellow
    Set-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao instalar dependências do front-end" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependências do front-end instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "Iniciando serviços..." -ForegroundColor Yellow

# Verificar se as portas estão livres
if (Test-Port $backendPort) {
    Write-Host "Porta $backendPort já está em uso (back-end)" -ForegroundColor Yellow
}

if (Test-Port 5173) {
    Write-Host "Porta 5173 já está em uso (front-end)" -ForegroundColor Yellow
}

Write-Host ""

# Iniciar o back-end em background
Write-Host "Iniciando back-end na porta $backendPort..." -ForegroundColor Cyan
Set-Location $backendDir

$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm start
} -ArgumentList $backendDir

# Aguardar um pouco para o back-end inicializar
Start-Sleep -Seconds 3

# Verificar se o back-end está rodando
$backendRunning = $false
for ($i = 1; $i -le 10; $i++) {
    if (Test-Port $backendPort) {
        $backendRunning = $true
        break
    }
    Start-Sleep -Seconds 1
}

if ($backendRunning) {
    Write-Host "Back-end iniciado com sucesso!" -ForegroundColor Green
    Write-Host "  API disponível em: http://localhost:$backendPort" -ForegroundColor Gray
} else {
    Write-Host "Back-end pode estar iniciando... Continuando..." -ForegroundColor Yellow
}

Write-Host ""

# Iniciar o front-end
Write-Host "Iniciando front-end na porta 5173..." -ForegroundColor Cyan
Set-Location $frontendDir

Write-Host ""
Write-Host "Projeto Hub iniciado!" -ForegroundColor Green
Write-Host "   Front-end: http://localhost:5173" -ForegroundColor Gray
Write-Host "   Back-end: http://localhost:$backendPort" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione Ctrl+C para parar os serviços" -ForegroundColor Yellow
Write-Host ""

# Executar o front-end (este ficará no terminal principal)
try {
    npm start
}
finally {
    # Limpar o job do back-end quando o script terminar
    Write-Host ""
    Write-Host "Parando serviços..." -ForegroundColor Yellow
    
    if ($backendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
        Write-Host "Back-end parado" -ForegroundColor Green
    }
    
    Write-Host "Script finalizado" -ForegroundColor Green
}


