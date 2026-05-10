# Docker Setup Guide for NT118

## Services Overview

This setup includes 3 containerized services:
- **PostgreSQL**: Database (port 5432)
- **Backend**: ASP.NET Core API (port 5058)
- **AI-Agentic**: FastAPI Python service (port 8000)

## Quick Start

### 1. Build and Run All Services

```bash
cd docker
docker-compose up -d --build
```

This will:
- Build the Backend (.NET) image
- Build the AI-Agentic (Python) image
- Start PostgreSQL database
- Start both services

### 2. Run Individual Services

#### Build Backend only:
```bash
docker build -t nt118-backend ../backend
```

#### Build AI-Agentic only:
```bash
docker build -t nt118-ai-agentic ../ai-agentic
```

#### Run Backend:
```bash
docker run -d \
  -p 5058:5058 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=5432;Database=nt118;Username=postgres;Password=postgres" \
  --name nt118-backend \
  nt118-backend
```

#### Run AI-Agentic:
```bash
docker run -d \
  -p 8000:8000 \
  --name nt118-ai-agentic \
  nt118-ai-agentic
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ai-agentic
docker-compose logs -f postgres
```

### 4. Stop Services

```bash
# Stop all
docker-compose down

# Stop specific service
docker stop nt118-backend
docker stop nt118-ai-agentic
```

### 5. Access Services

- **Backend API**: http://localhost:5058
- **Backend Swagger**: http://localhost:5058/swagger/index.html
- **AI-Agentic API**: http://localhost:8000
- **AI-Agentic Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## Docker Images

### Backend (ai-agentic/Dockerfile)
- **Base Image**: python:3.11-slim
- **Architecture**: Multi-stage build
- **Features**: 
  - Optimized for production
  - Health checks enabled
  - Minimal image size

### AI-Agentic (backend/Dockerfile)
- **Base Image**: mcr.microsoft.com/dotnet/aspnet:10.0
- **Architecture**: Multi-stage build (SDK → Build → Publish → Runtime)
- **Features**:
  - Multi-stage compilation
  - Optimized runtime image
  - Health checks enabled

## Environment Variables

### Backend
```
ConnectionStrings__DefaultConnection=Host=nt118-postgres;Port=5432;Database=nt118;Username=postgres;Password=postgres
ASPNETCORE_ENVIRONMENT=Production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENABLE_SSL=true
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=NT118 App
SMTP_APP_PASSWORD=your-app-password
```

### AI-Agentic
```
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

## Network Communication

Services are connected via `nt118-network` bridge network:
- Backend can communicate with PostgreSQL using hostname `nt118-postgres`
- AI-Agentic can communicate with Backend using hostname `nt118-backend`

## Troubleshooting

### Backend won't start
- Check PostgreSQL is healthy: `docker-compose ps`
- Check connection string in environment variables
- View logs: `docker-compose logs backend`

### AI-Agentic won't start
- Ensure all Python dependencies are in `requirements.txt`
- Check FastAPI entry point exists
- View logs: `docker-compose logs ai-agentic`

### Database issues
- Reset database: `docker volume rm docker_postgres_data`
- Rebuild everything: `docker-compose down --volumes && docker-compose up --build`

## Production Considerations

1. Update environment variables (passwords, email credentials)
2. Use environment file: `docker-compose --env-file .env.prod up`
3. Configure persistent volumes for data
4. Set up reverse proxy (nginx)
5. Enable SSL/TLS
6. Configure resource limits in docker-compose
7. Use private Docker registry for images
