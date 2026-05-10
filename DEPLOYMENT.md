# NT118 ShopeeLite — Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Azure Cloud                       │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ Frontend │    │ Backend  │    │AI-Agentic│       │
│  │ (nginx)  │───▶│  (.NET)  │◀───│ (FastAPI)│       │
│  │ :3000    │    │  :5058   │    │  :8000   │       │
│  └──────────┘    └────┬─────┘    └────┬─────┘       │
│                       │               │              │
│                       ▼               ▼              │
│                  ┌─────────────────────┐             │
│                  │   PostgreSQL 15     │             │
│                  │   (Flexible Server) │             │
│                  └─────────────────────┘             │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │     Azure Container Registry (ACR)           │    │
│  │  nt118-backend | nt118-ai | nt118-frontend   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Quick Start — Local Docker

```bash
# From project root
cd docker

# Set API keys (create .env file)
echo "GROQ_API_KEY=your_key_here" > .env
echo "LANGCHAIN_API_KEY=your_key_here" >> .env

# Build and start all services
docker-compose up --build -d

# Check health
curl http://localhost:5058/health   # Backend
curl http://localhost:8000/health   # AI-Agentic
curl http://localhost:3000/         # Frontend
```

## Deploy to Azure

### Prerequisites
- Azure CLI installed and logged in (`az login`)
- Terraform >= 1.5 installed
- Docker installed

### Step 1: Provision Infrastructure

```bash
cd terraform

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your passwords/keys

# Init and apply
terraform init
terraform plan
terraform apply
```

### Step 2: Build and Push Images

```bash
# Login to ACR
ACR_NAME=$(terraform output -raw acr_login_server)
az acr login --name nt118registry

# Build and push backend
docker build -t $ACR_NAME/nt118-backend:latest -f backend/Dockerfile backend/
docker push $ACR_NAME/nt118-backend:latest

# Build and push ai-agentic
docker build -t $ACR_NAME/nt118-ai:latest -f ai-agentic/Dockerfile ai-agentic/
docker push $ACR_NAME/nt118-ai:latest

# Build and push frontend
docker build -t $ACR_NAME/nt118-frontend:latest -f frontend/Dockerfile frontend/
docker push $ACR_NAME/nt118-frontend:latest
```

### Step 3: Initialize Database

```bash
# Get connection string
PG_CONN=$(terraform output -raw postgresql_connection_string)

# Run init script
psql "$PG_CONN" -f database/init.sql
psql "$PG_CONN" -f database/seed_vouchers.sql
```

### Step 4: Verify

```bash
terraform output backend_url
terraform output ai_agentic_url
terraform output frontend_url
```

## CI/CD (GitHub Actions)

### Setup Secrets
Add these to your GitHub repo → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service principal JSON |
| `DB_ADMIN_USER` | PostgreSQL admin username |
| `DB_ADMIN_PASSWORD` | PostgreSQL admin password |

### Create Service Principal

```bash
az ad sp create-for-rbac \
  --name "nt118-cicd" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-nt118 \
  --json-auth
```

Copy the JSON output to `AZURE_CREDENTIALS` secret.

### Trigger Deploy
- **Auto**: Push to `main` branch
- **Manual**: GitHub Actions → "Deploy NT118 to Azure" → Run workflow

## Environment Variables Reference

### Backend (.NET)
| Variable | Default | Description |
|----------|---------|-------------|
| `ConnectionStrings__DefaultConnection` | - | PostgreSQL connection string |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Runtime environment |
| `SMTP_*` | - | Email configuration |

### AI-Agentic (Python)
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:123456@localhost:5432/nt118` | Direct DB connection |
| `BACKEND_URL` | `http://localhost:5058` | HTTP fallback URL |
| `GROQ_API_KEY` | - | LLM API key |
| `MODEL_TYPE` | `groq` | LLM provider |

### Frontend (React Native)
| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | auto-detected | Backend API URL |
| `EXPO_PUBLIC_CHATBOT_URL` | auto-detected | AI chatbot URL |
