package init

import (
	"math/rand"
	"os"
	"time"

	"fornaxian.com/pixeldrain-web/webcontroller"
	"github.com/Fornaxian/config"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// PixelWebConfig contains the Pixeldrain Web UI configuration
type PixelWebConfig struct {
	APIURLExternal      string `toml:"api_url_external"`
	APIURLInternal      string `toml:"api_url_internal"`
	SessionCookieDomain string `toml:"session_cookie_domain"`
	ResourceDir         string `toml:"resource_dir"`
	DebugMode           bool   `toml:"debug_mode"`
	MaintenanceMode     bool   `toml:"maintenance_mode"`
}

// DefaultConfig is the default configuration for Pixeldrain Web
const DefaultConfig = `# Pixeldrain Web UI server configuration

api_url_external      = "/api" # Used in the web browser
api_url_internal      = "http://127.0.0.1:8080" # Used for internal API requests to the pixeldrain server, not visible to users
session_cookie_domain = ".pixeldrain.com"
resource_dir          = "res"
debug_mode            = false
maintenance_mode      = false
`

// Init initializes the Pixeldrain Web UI controllers
func Init(r *httprouter.Router, prefix string, setLogLevel bool) {
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
		webconf.SessionCookieDomain,
		webconf.MaintenanceMode,
		webconf.DebugMode,
	)
}
