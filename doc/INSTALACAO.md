# Guia de Instalação e Configuração

## Pré-requisitos

### Sistema Operacional
- Windows 10/11
- PowerShell 5.1+ ou PowerShell Core 7+

### Software Necessário
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (incluído com Node.js)
- **Git** - [Download](https://git-scm.com/)

### Verificação dos Pré-requisitos
```powershell
# Verificar versões instaladas
node --version    # Deve ser 18+
npm --version     # Deve ser 8+
git --version     # Qualquer versão recente
```

## Instalação

### 1. Clonar o Repositório
```powershell
git clone https://github.com/chmulato/hub_town.git
cd hub_town
```

### 2. Instalação Automática
Execute o script de inicialização que instala dependências automaticamente:
```powershell
.\start.ps1
```

O script irá:
- Verificar se as dependências estão instaladas
- Instalar pacotes do back-end se necessário
- Instalar pacotes do front-end se necessário
- Iniciar ambos os serviços

### 3. Instalação Manual

#### Back-end
```powershell
cd back-end
npm install
```

#### Front-end  
```powershell
cd front-end
npm install
```

## Configuração

### Estrutura de Arquivos
```
hub_town/
├── README.md                 # Documentação principal
├── start.ps1                 # Script de inicialização
├── .gitignore               # Arquivos ignorados pelo Git
├── back-end/                # Servidor API
│   ├── server.js            # Servidor Express
│   ├── package.json         # Dependências do back-end
│   └── data/                # Dados mock
│       ├── shopee-orders.json
│       └── mercadolivre-orders.json
├── front-end/               # Aplicação React
│   ├── front.jsx            # Componente principal
│   ├── index.html           # HTML base
│   ├── package.json         # Dependências do front-end
│   ├── vite.config.js       # Configuração Vite
│   └── src/
│       ├── main.jsx         # Entry point
│       └── index.css        # Estilos
└── doc/                     # Documentação técnica
    ├── API.md
    ├── ARQUITETURA.md
    └── INSTALACAO.md
```

### Configuração de Portas

O sistema usa as seguintes portas por padrão:
- **Back-end**: 3001
- **Front-end**: 5173

Para alterar a porta do back-end, edite `back-end/server.js`:
```javascript
const PORT = 3001; // Altere aqui
```

Para alterar a porta do front-end, edite `front-end/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5173 // Altere aqui
  }
})
```

### Configuração de CORS

O CORS está configurado para aceitar todas as origens em desenvolvimento. Para produção, edite `back-end/server.js`:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Específico
  // ... resto da configuração
});
```

## Execução

### Método 1: Script Automatizado (Recomendado)
```powershell
.\start.ps1
```

Este script:
- Detecta automaticamente a porta configurada no back-end
- Inicia o back-end em background
- Aguarda o back-end ficar online
- Inicia o front-end no terminal principal
- Gerencia os processos automaticamente

### Método 2: Manual

#### Terminal 1 - Back-end
```powershell
cd back-end
npm start
# ou
node server.js
```

#### Terminal 2 - Front-end  
```powershell
cd front-end
npm start
```

### Verificação da Instalação

1. **Back-end**: Acesse http://localhost:3001/api/shopee/orders
2. **Front-end**: Acesse http://localhost:5173
3. **API Unificada**: Acesse http://localhost:3001/api/orders/search?search=joão

## Solução de Problemas

### Erro: "Cannot find module"
```powershell
# Limpar cache e reinstalar
cd back-end
rm -rf node_modules package-lock.json
npm install

cd ../front-end  
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port already in use"
```powershell
# Encontrar processo na porta
netstat -ano | findstr :3001

# Matar processo (substitua PID)
taskkill /f /pid <PID>
```

### Erro: "CORS blocked"
- Verifique se o back-end está rodando
- Confirme a configuração de CORS no `server.js`
- Verifique se as URLs estão corretas no front-end

### Erro: PowerShell Execution Policy
```powershell
# Permitir execução de scripts (como administrador)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Front-end não carrega dados
1. Verifique se o back-end está rodando (porta 3001)
2. Abra DevTools (F12) e verifique erros no console
3. Confirme se a URL da API está correta no `front.jsx`

### Dados não aparecem
1. Verifique se os arquivos JSON existem em `back-end/data/`
2. Confirme se os arquivos têm formato JSON válido
3. Verifique permissões de leitura dos arquivos

## Scripts Disponíveis

### Back-end
```powershell
cd back-end
npm start          # Inicia servidor
npm run dev        # Modo desenvolvimento (se configurado)
```

### Front-end
```powershell  
cd front-end
npm start          # Inicia servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
```

## Configurações Avançadas

### Variáveis de Ambiente

Crie arquivo `.env` no back-end para configurações:
```
PORT=3001
NODE_ENV=development
```

### Configuração do Vite

Personalize `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Para acesso externo
    open: true  // Abrir browser automaticamente
  }
})
```

### Configuração do Express

Adicione middleware em `server.js`:
```javascript
// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rate limiting (adicionar express-rate-limit)
// Compression (adicionar compression)
```

## Próximos Passos

Após a instalação, consulte:
- [API.md](API.md) - Documentação da API
- [ARQUITETURA.md](ARQUITETURA.md) - Arquitetura do sistema
- [README.md](../README.md) - Visão geral do projeto
