# 💳 Lab005: Sistema de Geração e Validação de Código de Barras para Boletos

[![Azure Functions](https://img.shields.io/badge/Azure-Functions-0078D4?logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/services/functions/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](README.md)

Sistema completo de **geração e validação de códigos de barras para boletos bancários**, implementado com **Azure Functions** e frontend responsivo. Um exemplo prático de arquitetura cloud-native para processamento de pagamentos.

---

## 📚 Sumário

- [Características](#características)
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API REST](#api-rest)
- [Configuração](#configuração)
- [Deployment](#deployment)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)

---

## ✨ Características

### 🎯 Funcionalidades Principais

- ✅ **Geração de Código de Barras** - Cria códigos de barras de 44 dígitos conforme padrão brasileiro
- ✅ **Validação de Boletos** - Verifica integridade e validade de códigos
- ✅ **Geração de Imagem** - Produz código de barras em formato PNG (Code128)
- ✅ **Interface Responsiva** - Frontend moderno com suporte mobile
- ✅ **Processamento Assíncrono** - Persistência de dados via Azure Service Bus
- ✅ **API REST** - Endpoints prontos para integração

### 🚀 Recursos Técnicos

- 🔷 **Azure Functions** - Serverless, escalável automaticamente
- 📨 **Azure Service Bus** - Fila para processamento assíncrono
- 🗂️ **Base de dados** - Pronto para integração (MongoDB, SQL Server, etc.)
- 📊 **Logging** - Integração com Application Insights
- 🔒 **Autenticação** - Suporte a API Keys
- 📱 **CORS** - Configurado para acesso frontend

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────┐
│              Frontend (SPA)                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ • Gerador de Códigos de Barras                    │ │
│  │ • Validador de Boletos                            │ │
│  │ • Visualizador de Imagens                         │ │
│  │ • Download/Cópia de Códigos                       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────┬──────────────────────────────────────┘
                  │ HTTP/HTTPS
                  ▼
┌──────────────────────────────────────────────────────────┐
│         Azure Functions (Backend Serverless)            │
│  ┌────────────────────┐    ┌──────────────────────┐     │
│  │ fnGeradorBoletos   │    │ fnValidaBoletos      │     │
│  │ POST /barcode-     │    │ POST /barcode-       │     │
│  │ generator          │    │ validate             │     │
│  └────────┬───────────┘    └──────────────────────┘     │
└───────────┼──────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────┐
│         Azure Service Bus (Mensageria)                  │
│  Queue: "codigo-boletos"                                │
│  • Persistência de dados                                │
│  • Processamento desacoplado                            │
│  • Retry automático                                     │
└──────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

**Geração:**

```
Cliente → fnGeradorBoletos → Gera PNG + Código → Service Bus → Cliente
```

**Validação:**

```
Cliente → fnValidaBoletos → Valida Formato → Extrai Data → Cliente
```

---

## 📋 Requisitos

### Obrigatórios

- **[.NET SDK 8.0+](https://dotnet.microsoft.com/download)** - Runtime .NET
- **[Azure Functions Core Tools 4.x](https://github.com/Azure/azure-functions-core-tools)** - CLI para funções
- **[Node.js 18+](https://nodejs.org/)** (opcional) - Para ferramentas auxiliares
- **Conta Azure** - Para deployment em nuvem

### Opcional

- **Visual Studio Code** - Editor recomendado
- **Azure CLI** - Para gerenciar recursos Azure
- **Postman** - Para testar APIs
- **Git** - Para controle de versão

---

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/laboratorio.git
cd Laboratorio/Lab005
```

### 2. Restaurar Dependências

```bash
# fnGeradorBoletos
cd fnGeradorBoletos
dotnet restore
cd ..

# fnValidaBoletos
cd fnValidaBoletos
dotnet restore
cd ..
```

### 3. Configurar Variáveis de Ambiente

Criar arquivo `local.settings.json` em cada função:

**fnGeradorBoletos/local.settings.json:**

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "ServiceBusConnectionString": "Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY"
  }
}
```

**fnValidaBoletos/local.settings.json:**

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"
  }
}
```

### 4. Compilar Projeto

```bash
# fnGeradorBoletos
cd fnGeradorBoletos
dotnet build
cd ..

# fnValidaBoletos
cd fnValidaBoletos
dotnet build
cd ..
```

---

## 🎯 Uso

### Execução Local

#### Terminal 1: Iniciar fnGeradorBoletos

```bash
cd fnGeradorBoletos
func start
```

Output esperado:

```
Azure Functions Core Tools (4.x)
...
Functions:
    barcode-generator: [POST] http://localhost:7032/api/barcode-generator
```

#### Terminal 2: Iniciar fnValidaBoletos

```bash
cd fnValidaBoletos
func start
```

Output esperado:

```
Functions:
    barcode-validate: [POST] http://localhost:7263/api/barcode-validate
```

#### Terminal 3: Servir Frontend

```bash
cd Front

# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js
npx http-server

# Opção 3: VSCode Extension
# Instalar "Live Server" e clicar em "Go Live"
```

#### Acessar Aplicação

Abrir navegador em: **http://localhost:8000**

### Exemplos de Requisições

#### Gerar Código de Barras

```bash
curl -X POST http://localhost:7032/api/barcode-generator \
  -H "Content-Type: application/json" \
  -H "x-functions-key: YOUR_FUNCTION_KEY" \
  -d '{
    "valor": 150.50,
    "dataVencimento": "2026-12-31"
  }'
```

**Response (Sucesso):**

```json
{
  "barcode": "00720261231501500000000000000000000000000000",
  "valorOriginal": 150.5,
  "DataVencimento": "2026-12-31T00:00:00",
  "ImagemBase64": "iVBORw0KGgoAAAANSUhEUgAAAyQAAABkCAIAAACzLLvwAAAE..."
}
```

#### Validar Código de Barras

```bash
curl -X POST http://localhost:7263/api/barcode-validate \
  -H "Content-Type: application/json" \
  -H "x-functions-key: YOUR_FUNCTION_KEY" \
  -d '{
    "barcode": "00720261231501500000000000000000000000000000"
  }'
```

**Response (Sucesso):**

```json
{
  "valido": true,
  "mensagem": "Boleto válido",
  "vencimento": "31-12-2026"
}
```

**Response (Erro):**

```json
{
  "valido": false,
  "mensagem": "O campo barcode deve ter 44 caracteres"
}
```

---

## 📁 Estrutura do Projeto

```
Lab005/
├── fnGeradorBoletos/          # Function: Geração de Boletos
│   ├── fnGeradorBoletos.cs    # Lógica principal
│   ├── fnGeradorBoletos.csproj # Dependências
│   ├── Program.cs              # Configuração da aplicação
│   ├── host.json               # Configuração do host
│   ├── local.settings.json     # Variáveis locais
│   └── Properties/
│       └── launchSettings.json # Porta de execução
│
├── fnValidaBoletos/           # Function: Validação de Boletos
│   ├── Function1.cs           # Lógica principal
│   ├── fnValidaBoletos.csproj # Dependências
│   ├── Program.cs             # Configuração
│   ├── host.json              # Configuração do host
│   ├── local.settings.json    # Variáveis locais
│   └── Properties/
│       └── launchSettings.json # Porta de execução
│
├── Front/                     # Interface Web
│   ├── index.html             # Estrutura HTML
│   ├── styles.css             # Estilos CSS
│   ├── script.js              # Lógica JavaScript
│   └── ...
│
└── README.md                  # Este arquivo
```

---

## 🔌 API REST

### Endpoint 1: Gerador de Código de Barras

**Informações:**

- **URL**: `/api/barcode-generator`
- **Método**: `POST`
- **Porta**: `7032` (local)
- **Autenticação**: Function Key

**Request Body:**

```typescript
{
  valor: number; // Valor em reais (ex: 150.50)
  dataVencimento: string; // Data no formato YYYY-MM-DD
}
```

**Response (200 OK):**

```typescript
{
  barcode: string; // Código de barras (44 dígitos)
  valorOriginal: number; // Valor informado
  DataVencimento: string; // Data ISO
  ImagemBase64: string; // PNG em Base64
}
```

**Response (400 Bad Request):**

```typescript
{
  error: string; // Mensagem de erro
}
```

**Validações:**

- ✓ `valor` obrigatório e > 0
- ✓ `dataVencimento` obrigatório em formato YYYY-MM-DD

---

### Endpoint 2: Validador de Código de Barras

**Informações:**

- **URL**: `/api/barcode-validate`
- **Método**: `POST`
- **Porta**: `7263` (local)
- **Autenticação**: Function Key

**Request Body:**

```typescript
{
  barcode: string; // Código com 44 dígitos
}
```

**Response (200 OK):**

```typescript
{
  valido: boolean; // true/false
  mensagem: string; // Descrição
  vencimento: string; // Data formatada (dd-MM-yyyy)
}
```

**Response (400 Bad Request):**

```typescript
{
  valido: false;
  mensagem: string; // Descrição do erro
}
```

**Validações:**

- ✓ `barcode` obrigatório
- ✓ Exatamente 44 caracteres
- ✓ Data válida (posições 3-10)

---

## ⚙️ Configuração

### Variáveis de Ambiente

#### fnGeradorBoletos

| Variável                     | Descrição                        | Obrigatório |
| ---------------------------- | -------------------------------- | ----------- |
| `ServiceBusConnectionString` | Connection string do Service Bus | Sim         |
| `AzureWebJobsStorage`        | Storage Account para runtime     | Sim         |
| `FUNCTIONS_WORKER_RUNTIME`   | `dotnet-isolated`                | Sim         |

#### fnValidaBoletos

| Variável                   | Descrição                    | Obrigatório |
| -------------------------- | ---------------------------- | ----------- |
| `AzureWebJobsStorage`      | Storage Account para runtime | Sim         |
| `FUNCTIONS_WORKER_RUNTIME` | `dotnet-isolated`            | Sim         |

### Portas Padrão

- **fnGeradorBoletos**: `7032`
- **fnValidaBoletos**: `7263`
- **Frontend**: `8000`

Editar em `launchSettings.json` se necessário.

### CORS

**Frontend (script.js):**

```javascript
const API_URL = 'http://localhost:7032/api/barcode-generator';
const VALIDATE_URL = 'http://localhost:7263/api/barcode-validate';
```

---

## 🌍 Deployment

### Azure Cloud Deployment

#### Pré-requisitos

```bash
# Instalar Azure CLI
# https://docs.microsoft.com/cli/azure/install-azure-cli

# Login
az login

# Criar grupo de recursos
az group create --name lab005-rg --location eastus
```

#### 1. Criar Storage Account

```bash
az storage account create \
  --resource-group lab005-rg \
  --name lab005storage \
  --sku Standard_LRS
```

#### 2. Criar Function Apps

```bash
# fnGeradorBoletos
az functionapp create \
  --resource-group lab005-rg \
  --consumption-plan-location eastus \
  --runtime dotnet-isolated \
  --runtime-version 8 \
  --functions-version 4 \
  --name fn-gerador-boletos \
  --storage-account lab005storage

# fnValidaBoletos
az functionapp create \
  --resource-group lab005-rg \
  --consumption-plan-location eastus \
  --runtime dotnet-isolated \
  --runtime-version 8 \
  --functions-version 4 \
  --name fn-valida-boletos \
  --storage-account lab005storage
```

#### 3. Criar Service Bus (Opcional)

```bash
# Namespace
az servicebus namespace create \
  --resource-group lab005-rg \
  --name lab005-ns \
  --sku Standard

# Fila
az servicebus queue create \
  --resource-group lab005-rg \
  --namespace-name lab005-ns \
  --name codigo-boletos

# Connection String
az servicebus namespace authorization-rule keys list \
  --resource-group lab005-rg \
  --namespace-name lab005-ns \
  --name RootManageSharedAccessKey \
  --query primaryConnectionString -o tsv
```

#### 4. Configurar Secrets

```bash
# fnGeradorBoletos
az functionapp config appsettings set \
  --name fn-gerador-boletos \
  --resource-group lab005-rg \
  --settings "ServiceBusConnectionString=<seu-connection-string>"
```

#### 5. Publicar Funções

```bash
# fnGeradorBoletos
cd fnGeradorBoletos
func azure functionapp publish fn-gerador-boletos
cd ..

# fnValidaBoletos
cd fnValidaBoletos
func azure functionapp publish fn-valida-boletos
cd ..
```

#### 6. Fazer Deploy do Frontend

```bash
# Opção 1: Azure Static Web Apps
az staticwebapp create \
  --name lab005-front \
  --resource-group lab005-rg \
  --source ./Front \
  --location eastus

# Opção 2: Azure Blob Storage + CDN
az storage blob upload-batch \
  --account-name lab005storage \
  --destination \$web \
  --source ./Front
```

#### 7. Atualizar URLs do Frontend

Editar `Front/script.js`:

```javascript
const API_URL =
  'https://fn-gerador-boletos.azurewebsites.net/api/barcode-generator';
const VALIDATE_URL =
  'https://fn-valida-boletos.azurewebsites.net/api/barcode-validate';
```

---

## 🔐 Segurança

### Recomendações para Produção

1. **Autenticação**

   ```csharp
   [HttpTrigger(AuthorizationLevel.Function, "post")]  // Requer Key
   // Não usar: AuthorizationLevel.Anonymous
   ```

2. **HTTPS Obrigatório**

   ```bash
   az functionapp update \
     --name fn-gerador-boletos \
     --resource-group lab005-rg \
     --set httpsOnly=true
   ```

3. **CORS Restrito**

   ```bash
   az functionapp cors add \
     --name fn-gerador-boletos \
     --resource-group lab005-rg \
     --allowed-origins "https://seu-dominio.com"
   ```

4. **Secrets em Key Vault**

   ```bash
   az keyvault create \
     --resource-group lab005-rg \
     --name lab005-kv

   az keyvault secret set \
     --vault-name lab005-kv \
     --name ServiceBusConnectionString \
     --value "<valor>"
   ```

5. **Monitoramento**
   - Ativar Application Insights
   - Configurar alertas de erro
   - Auditar logs de acesso

---

## 🧪 Testes

### Teste Manual com Postman

1. Importar collection:

```json
{
  "info": { "name": "Lab005 API" },
  "item": [
    {
      "name": "Gerar Boleto",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/barcode-generator",
        "header": [{ "key": "x-functions-key", "value": "{{function_key}}" }],
        "body": {
          "mode": "raw",
          "raw": "{\"valor\":100.00,\"dataVencimento\":\"2026-12-31\"}"
        }
      }
    },
    {
      "name": "Validar Boleto",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/barcode-validate",
        "header": [{ "key": "x-functions-key", "value": "{{function_key}}" }],
        "body": {
          "mode": "raw",
          "raw": "{\"barcode\":\"00720261231501000000000000000000000000000000\"}"
        }
      }
    }
  ]
}
```

---

## 📦 Dependências

### fnGeradorBoletos

```xml
<PackageReference Include="Azure.Messaging.ServiceBus" Version="7.18.4" />
<PackageReference Include="BarcodeLib" Version="3.1.5" />
<PackageReference Include="Microsoft.Azure.Functions.Worker" Version="2.0.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore" Version="2.0.0" />
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
```

### fnValidaBoletos

```xml
<PackageReference Include="Microsoft.Azure.Functions.Worker" Version="2.0.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore" Version="2.0.0" />
<PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Criar branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Ver arquivo [LICENSE](LICENSE) para detalhes.

---

## 💬 Suporte

### Recursos

- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [Azure Service Bus Docs](https://docs.microsoft.com/azure/service-bus-messaging/)
- [BarcodeLib Documentation](https://www.nuget.org/packages/BarcodeLib/)
- [Padrão Brasileiro de Código de Barras](https://www.febraban.org.br/)

---

## 👨‍💻 Autores

- **Giulherme Carvalho** - _Desenvolvimento Principal_ - [GitHub](https://github.com/guilhermesc-6)

---

## 🙏 Agradecimentos

- Azure Functions documentation
- BarcodeLib community
- Community de .NET

---

<div align="center">

**[⬆ Voltar ao topo](#-lab005-sistema-de-geração-e-validação-de-código-de-barras-para-boletos)**

Feito com ❤️ para a comunidade cloud-native

</div>
