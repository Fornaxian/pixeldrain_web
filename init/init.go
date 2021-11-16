package init

import (
	"math/rand"
	"os"
	"time"

	"fornaxian.tech/config"
	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_web/webcontroller"
	"github.com/julienschmidt/httprouter"
)

// PixelWebConfig contains the Pixeldrain Web UI configuration
type PixelWebConfig struct {
	APIURLExternal      string `toml:"api_url_external"`
	APIURLInternal      string `toml:"api_url_internal"`
	WebsiteAddress      string `toml:"website_address"`
	SessionCookieDomain string `toml:"session_cookie_domain"`
	ResourceDir         string `toml:"resource_dir"`
	DebugMode           bool   `toml:"debug_mode"`
	ProxyAPIRequests    bool   `toml:"proxy_api_requests"`
	MaintenanceMode     bool   `toml:"maintenance_mode"`
}

// DefaultConfig is the default configuration for Pixeldrain Web
const DefaultConfig = `## Pixeldrain Web UI server configuration

# Address used in the browser for making requests directly to the API. Can be
# relative to the current domain name
api_url_external      = "/api"

# Address used to make internal API requests to the backend
api_url_internal      = "https://pixeldrain.com/api"

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

	// Seed the RNG
	rand.Seed(time.Now().UnixNano())

	var webconf = &PixelWebConfig{}
	var _, err = config.New(
		DefaultConfig,
		"",
		"pdwebconf.toml",
		webconf,
		true,
	)
	if err != nil {
		log.Error("Failed to load config file: %s", err)
		os.Exit(1)
	}

	if !webconf.DebugMode && setLogLevel {
		log.SetLogLevel(log.LevelInfo)
	}

	webcontroller.New(
		r,
		prefix,
		webconf.ResourceDir,
		webconf.APIURLInternal,
		webconf.APIURLExternal,
		webconf.WebsiteAddress,
		webconf.SessionCookieDomain,
		webconf.MaintenanceMode,
		webconf.DebugMode,
		webconf.ProxyAPIRequests,
	)
}
