# ============================================
# NT118 ShopeeLite — Azure Infrastructure
# ============================================
# Provisions: Resource Group, Container Registry,
# PostgreSQL Flexible Server, App Service Plan,
# and 3 Web Apps (backend, ai-agentic, frontend)
# ============================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
  }
}

provider "azurerm" {
  features {}
}

# ── Resource Group ──
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}"
  location = var.location

  tags = {
    project     = var.project_name
    environment = "production"
    managed_by  = "terraform"
  }
}

# ── Container Registry ──
resource "azurerm_container_registry" "acr" {
  name                = "${var.project_name}registry"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = azurerm_resource_group.main.tags
}

# ── PostgreSQL Flexible Server ──
resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "${var.project_name}-pgserver"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  administrator_login    = var.db_admin_user
  administrator_password = var.db_admin_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
  zone                   = "1"

  tags = azurerm_resource_group.main.tags
}

# Allow Azure services to access DB
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Create the database
resource "azurerm_postgresql_flexible_server_database" "nt118db" {
  name      = "nt118"
  server_id = azurerm_postgresql_flexible_server.db.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# ── App Service Plan (shared for all 3 apps) ──
resource "azurerm_service_plan" "plan" {
  name                = "${var.project_name}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = azurerm_resource_group.main.tags
}

# ── Connection string ──
locals {
  pg_connection_string = "Host=${azurerm_postgresql_flexible_server.db.fqdn};Port=5432;Database=nt118;Username=${var.db_admin_user};Password=${var.db_admin_password};SSL Mode=Require"
  pg_database_url      = "postgresql://${var.db_admin_user}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.db.fqdn}:5432/nt118?sslmode=require"
}

# ── Backend Web App ──
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      docker_image_name   = "${azurerm_container_registry.acr.login_server}/${var.project_name}-backend:latest"
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
    }
    always_on = true
  }

  app_settings = {
    "ConnectionStrings__DefaultConnection"  = local.pg_connection_string
    "ASPNETCORE_ENVIRONMENT"                = "Production"
    "SMTP_HOST"                             = "smtp.gmail.com"
    "SMTP_PORT"                             = "587"
    "SMTP_ENABLE_SSL"                       = "true"
    "SMTP_FROM_EMAIL"                       = "hiroplayga@gmail.com"
    "SMTP_FROM_NAME"                        = "NT118 App"
    "SMTP_APP_PASSWORD"                     = var.smtp_app_password
    "DOCKER_REGISTRY_SERVER_URL"            = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"       = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"       = azurerm_container_registry.acr.admin_password
    "WEBSITES_PORT"                         = "5058"
  }

  tags = azurerm_resource_group.main.tags
}

# ── AI-Agentic Web App ──
resource "azurerm_linux_web_app" "ai_agentic" {
  name                = "${var.project_name}-ai"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      docker_image_name   = "${azurerm_container_registry.acr.login_server}/${var.project_name}-ai:latest"
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
    }
    always_on = true
  }

  app_settings = {
    "DATABASE_URL"                    = local.pg_database_url
    "BACKEND_URL"                     = "https://${azurerm_linux_web_app.backend.default_hostname}"
    "CORE_SERVICE_URL"                = "https://${azurerm_linux_web_app.backend.default_hostname}"
    "GROQ_API_KEY"                    = var.groq_api_key
    "MODEL_TYPE"                      = "groq"
    "GROQ_MODEL"                      = "openai/gpt-oss-120b"
    "GROQ_TIMEOUT"                    = "120"
    "LANGCHAIN_API_KEY"               = var.langchain_api_key
    "LANGCHAIN_TRACING_V2"            = "true"
    "LANGCHAIN_PROJECT"               = "nt118-chatbot"
    "PYTHONUNBUFFERED"                = "1"
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
    "WEBSITES_PORT"                   = "8000"
  }

  tags = azurerm_resource_group.main.tags
}

# ── Frontend Web App ──
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-web"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    application_stack {
      docker_image_name   = "${azurerm_container_registry.acr.login_server}/${var.project_name}-frontend:latest"
      docker_registry_url = "https://${azurerm_container_registry.acr.login_server}"
    }
    always_on = false
  }

  app_settings = {
    "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.acr.admin_password
    "WEBSITES_PORT"                   = "3000"
  }

  tags = azurerm_resource_group.main.tags
}
