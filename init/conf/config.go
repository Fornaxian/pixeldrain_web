package conf

type PixelWebConfig struct {
	APIURLExternal    string `toml:"api_url_external"`
	APIURLInternal    string `toml:"api_url_internal"`
	StaticResourceDir string `toml:"static_resource_dir"`
	TemplateDir       string `toml:"template_dir"`
	DebugMode         bool   `toml:"debug_mode"`
}

const DefaultConfig = `# Pixeldrain Web UI server configuration

api_url_external = "https://sia.pixeldrain.com/api" # Used in the web browser, should be a full URL. Not ending with a slash
api_url_internal = "http://127.0.0.1:8080/api" # Used for internal API requests to the pixeldrain server, not visible to users
static_resource_dir = "res/static"
template_dir = "res/template"
debug_mode = false`
