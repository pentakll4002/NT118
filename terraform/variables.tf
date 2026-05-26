# ── Terraform Variables ──
# Override these via terraform.tfvars or -var flags

variable "project_name" {
  default     = "nt118"
  description = "Project prefix for all Azure resources"
  type        = string
}

variable "location" {
  default     = "Southeast Asia"
  description = "Azure region for deployment"
  type        = string
}

variable "db_admin_user" {
  default     = "nt118admin"
  description = "PostgreSQL Flexible Server admin username"
  type        = string
}

variable "db_admin_password" {
  description = "PostgreSQL Flexible Server admin password (min 8 chars, must include uppercase, lowercase, number)"
  type        = string
  sensitive   = true
}

variable "groq_api_key" {
  description = "Groq API key for the LLM chatbot"
  type        = string
  sensitive   = true
  default     = ""
}

variable "langchain_api_key" {
  description = "LangChain API key for tracing"
  type        = string
  sensitive   = true
  default     = ""
}

variable "smtp_app_password" {
  description = "Gmail App Password for email notifications"
  type        = string
  sensitive   = true
  default     = ""
}

variable "app_service_sku" {
  default     = "B1"
  description = "App Service Plan SKU tier (B1=Basic, S1=Standard, P1v3=Premium)"
  type        = string
}
