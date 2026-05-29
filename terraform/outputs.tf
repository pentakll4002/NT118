# ── Outputs ──

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  value     = azurerm_container_registry.acr.admin_username
  sensitive = true
}

output "acr_admin_password" {
  value     = azurerm_container_registry.acr.admin_password
  sensitive = true
}

output "postgresql_fqdn" {
  value = azurerm_postgresql_flexible_server.db.fqdn
}

output "postgresql_connection_string" {
  value     = local.pg_connection_string
  sensitive = true
}

output "postgresql_database_url" {
  value     = local.pg_database_url
  sensitive = true
}

output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "ai_agentic_url" {
  value = "https://${azurerm_linux_web_app.ai_agentic.default_hostname}"
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}
