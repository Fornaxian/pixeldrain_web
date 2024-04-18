package init

import (
	"os"

	"fornaxian.tech/config"
	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_web/webcontroller"
	"github.com/julienschmidt/httprouter"
)

// DefaultConfig is the default configuration for Pixeldrain Web
const DefaultConfig = `## Pixeldrain Web UI server configuration

# Address used in the browser for making requests directly to the API. Can be
# relative to the current domain name
api_url_external      = "/api"

# Address used to make internal API requests to the backend
api_url_internal      = "https://pixeldrain.com/api"

# When connecting to the API over a Unix domain socket you should enter the
# socket path here. api_url_internal needs to be correct too, as the API path
# prefix will be derived from there
api_socket_path       = ""

website_address       = "https://pixeldrain.com"
session_cookie_domain = ""
resource_dir          = "res"

# Parse all the templates every time a request comes in
debug_mode            = true

# Create proxy listeners to forward all requests made to /api to
# api_url_internal
proxy_api_requests    = true

# When this is true every request will return a maintainance HTML page
maintenance_mode      = false
`

// Init initializes the Pixeldrain Web UI controllers
func Init(r *httprouter.Router, prefix string, setLogLevel bool) {
	log.Colours = true
	log.Info("Starting web UI server (PID %v)", os.Getpid())

	var conf webcontroller.Config
	var _, err = config.New(
		DefaultConfig,
		"",
		"pdwebconf.toml",
		&conf,
		true,
	)
	if err != nil {
		log.Error("Failed to load config file: %s", err)
		os.Exit(1)
	}

	if !conf.DebugMode && setLogLevel {
		log.SetLogLevel(log.LevelInfo)
	}

	webcontroller.New(r, prefix, conf)
}
