package conf

type PixelWebConfig struct {
	APIURLExternal      string `toml:"api_url_external"`
	APIURLInternal      string `toml:"api_url_internal"`
	SessionCookieDomain string `toml:"session_cookie_domain"`
	ResourceDir         string `toml:"resource_dir"`
	DebugMode           bool   `toml:"debug_mode"`
	MaintenanceMode     bool   `toml:"maintenance_mode"`
}

const DefaultConfig = `# Pixeldrain Web UI server configuration

api_url_external      = "/api" # Used in the web browser
api_url_internal      = "http://127.0.0.1:8080" # Used for internal API requests to the pixeldrain server, not visible to users
session_cookie_domain = ".pixeldrain.com"
resource_dir          = "res"
debug_mode            = false
maintenance_mode      = false
`
