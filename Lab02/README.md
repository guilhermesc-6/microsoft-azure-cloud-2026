# WRC Notícias - Azure Container Apps Lab

## 📋 Visão Geral do Projeto

Este laboratório demonstra a containerização e deployment de uma **aplicação web de notícias sobre World Rally Championship (WRC)** utilizando **Azure Container Apps**. O projeto implementa uma arquitetura cloud-native moderna, com foco em escalabilidade, eficiência de recursos e deployment simplificado.

**Aplicação**: Um portal de notícias interativo sobre WRC, com interface responsiva construída em HTML5 e servida através do Nginx em um container Docker.

---

## 🏗️ Arquitetura e Componentes

### Stack Tecnológico
- **Containerização**: Docker + Nginx Alpine
- **Orquestração**: Azure Container Apps
- **Registro de Imagens**: Azure Container Registry (ACR)
- **Infraestrutura**: Azure Resource Group + Container Apps Environment
- **Linguagem de Infraestrutura**: PowerShell + Azure CLI

### Estrutura de Arquivos

```
Lab02/
├── dockerfile                 # Configuração da imagem Docker
├── scripts.ps1               # Automação de deployment (PowerShell)
└── WRC/
    └── html/
        └── index.html        # Aplicação frontend
```

---

## 🚀 Processo de Deployment

### 1. **Construção da Imagem Docker**
```bash
docker build -t wrc-news-guilherme-app:latest .
```

O `dockerfile` utiliza:
- **Base Image**: `nginx:alpine` (leve e otimizado)
- **Porta**: 80 (padrão HTTP)
- **Conteúdo**: Cópia dos arquivos HTML estáticos para `/usr/share/nginx/html`

**Benefício**: Imagem mínima (~40MB) com servidor web pré-configurado.

### 2. **Teste Local**
```bash
docker run -d -p 80:80 --name wrc-news-guilherme-app wrc-news-guilherme-app:latest
```

---

## 🔷 Azure Container Apps - Processo de Deployment

### Passo 1: Autenticação e Preparação

```powershell
az login
```

Conectar-se à sua conta Azure.

### Passo 2: Criar Resource Group

```powershell
az group create --name containerapplab003 --location westus
```

**Insight**: Resource Groups são contentores lógicos para gerenciar todos os recursos relacionados em uma única localização geográfica.

### Passo 3: Criar Azure Container Registry (ACR)

```powershell
az acr create --resource-group containerapplab003 `
  --name wrcnewsregistry --sku Basic
```

**O que é ACR?**
- Registro privado para armazenar imagens Docker
- Integração nativa com Container Apps
- Replicação geográfica disponível em SKUs superiores
- Scanning de segurança automático

### Passo 4: Autenticar e Fazer Push da Imagem

```powershell
az acr login --name wrcnewsregistry

docker tag wrc-news-guilherme-app:latest `
  wrcnewsregistry.azurecr.io/wrc-news-guilherme-app:latest

docker push wrcnewsregistry.azurecr.io/wrc-news-guilherme-app:latest
```

**Fluxo de Imagem**:
```
Docker Build (Local)
    ↓
Docker Tag (com registry)
    ↓
Docker Push (para ACR)
    ↓
Armazenado em ACR (Azure)
```

### Passo 5: Criar Container Apps Environment

```powershell
az containerapp env create --name wrc-news-guilherme-env `
  --resource-group containerapplab003 --location westus
```

**O que é o Environment?**
- Espaço de trabalho gerenciado para Container Apps
- Suporta múltiplas aplicações
- Oferece VNET, logging e monitoring integrados
- Gerenciamento automático de Dapr (se habilitado)

### Passo 6: Criar e Publicar Container App

```powershell
az containerapp create --name wrc-news-guilherme-app `
  --resource-group containerapplab003 `
  --environment wrc-news-guilherme-env `
  --image wrcnewsregistry.azurecr.io/wrc-news-guilherme-app:latest `
  --ingress 'external' --target-port 80 `
  --registry-server wrcnewsregistry.azurecr.io `
  --registry-username $username `
  --registry-password $password
```

**Configurações Importantes**:
- `--ingress external`: Expõe a aplicação publicamente com URL
- `--target-port 80`: Porta interna do container (Nginx)
- Credenciais do ACR: Autenticação privada para pull de imagens

---

## 🎯 Principais Insights e Aprendizados

### Container Apps

- Execução Serverless
- Escalabilidade Automatica
- Ambiente Gerenciado
- Suporte a Microserviços
- Integração com Eventos e Workfloes

### 1. **Abstração de Orquestração**
Azure Container Apps abstrai a complexidade do Kubernetes, oferecendo:
- ✅ Escalamento automático baseado em métricas
- ✅ Gerenciamento de revisões (canary deployments)
- ✅ Zero downtime durante updates
- ❌ Sem necessidade de conhecer YAML de Kubernetes complexo

### 2. **Segurança Integrada**
- Imagens armazenadas em ACR privado
- Credenciais gerenciadas automaticamente
- Suporte a Managed Identity para acesso a outros serviços Azure
- Network policies e VNET integration

### 3. **Escalabilidade Inteligente**
Container Apps oferece **auto-scaling** baseado em:
- CPU e Memória
- Requisições HTTP
- Métricas customizadas (integração com Application Insights)

### 4. **Custo-Efetivo**
- Pagamento por vCPU/hora de execução (não por hora de máquina)
- Escalamento para zero durante inatividade
- Sem overhead de gerenciar VMs ou clusters Kubernetes

### 5. **Image Scanning Automático**
Azure ACR detecta vulnerabilidades em tempo real:
- Analisa dependências
- Identifica CVEs conhecidas
- Recomenda patches

### 6. **Casos de Usos**
- Aplicações Web e APIs
- Arquiteturas de Microserviços
- Processamento de Eventos
- Ambientes de Desenvolvimento e Teste


---

## 🌟 Possibilidades e Extensões Futuras

### 🔄 Integração com Pipelines CI/CD
```yaml
# GitHub Actions / Azure DevOps
- Build automático ao fazer push
- Teste automático
- Deploy automático para Container Apps
```

### 📊 Monitoring e Observabilidade
- **Application Insights**: Rastreamento de performance
- **Log Analytics**: Agregação de logs centralizados
- **Azure Monitor**: Alertas e dashboards customizados

### 🌍 Multi-Region Deployment
```powershell
# Replicar em múltiplas regiões
# Container Apps suporta traffic splitting entre regiões
# Ideal para alta disponibilidade global
```

### 🔐 Secrets Management
```powershell
# Azure Key Vault integration
# Injetar secrets como variáveis de ambiente
# Sem hardcoding de credenciais
```

### 📱 API Backend
- Expandir a aplicação com um backend (Node.js, Python, .NET)
- Usar Service-to-service authentication
- Integrar com banco de dados Azure (Cosmos DB, SQL)

### 🚀 Dapr Integration
- Implementar padrões distribuídos (pub/sub, state management)
- Service discovery automático
- Simplificar comunicação entre microserviços

### 🐛 Canary Deployments
```powershell
# Direcionar 10% do tráfego para nova versão
# Monitorar métricas
# Incrementar gradualmente ou fazer rollback
```

### 📈 Escalamento Customizado
```python
# Integrar com Application Insights
# Criar regras de escalamento baseadas em métricas de negócio
# Ex: Escalar durante horários de pico de notícias WRC
```

---

## 📸 Resumo Visual do Fluxo de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Docker Build                                     │  │
│  │     dockerfile → wrc-news-guilherme-app:latest      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│               AZURE CONTAINER REGISTRY (ACR)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Docker Tag & Push                               │  │
│  │     wrcnewsregistry.azurecr.io/...                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│          AZURE CONTAINER APPS ENVIRONMENT                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Container App Creation & Deployment             │  │
│  │     • Ingress: External (Public URL)                │  │
│  │     • Target Port: 80 (Nginx)                       │  │
│  │     • Auto-scaling: Enabled                         │  │
│  │     • Registry Authentication: ACR                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
        ✅ PRODUCTION READY
      https://<app-url>.azurecontainerapps.io/
```

---

## 🎓 Conclusão

Este laboratório demonstra como **Azure Container Apps** simplifica o journey de um desenvolvedor:

1. **Foco no código**, não na infraestrutura
2. **Deploy em minutos**, não em horas
3. **Escalabilidade automática** sem configuração manual
4. **Segurança enterprise** out-of-the-box
5. **Custos otimizados** com pagamento por uso real

**Azure Container Apps é o sweet spot** entre gerenciar VMs manualmente e a complexidade de Kubernetes, sendo ideal para **aplicações cloud-native modernas** que precisam de escalabilidade, confiabilidade e facilidade operacional.

---

## 📚 Referências

- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Container Registry](https://learn.microsoft.com/en-us/azure/container-registry/)
- [Docker & Nginx Best Practices](https://docs.docker.com/)
- [Azure CLI Commands](https://learn.microsoft.com/en-us/cli/azure/)

---

**Criado em**: 21 de Fevereiro de 2026  
**Versão**: 1.0  
