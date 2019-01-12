package main

import (
	"net/http"
	"os"

	"fornaxian.com/pixeldrain-web/init/conf"
	"fornaxian.com/pixeldrain-web/webcontroller"

	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// This is just a launcher for the web server. During testing the app would
// be directly embedded by another Go project. And when deployed it will run
// independently.
func main() {
	log.Info("Starting web UI server in docker mode (PID %v)", os.Getpid())

	var webconf = &conf.PixelWebConfig{
		StaticResourceDir: "/opt/pixeldrain/res/static",
		TemplateDir:       "/opt/pixeldrain/res/template",
	}

	if webconf.APIURLExternal, _ = os.LookupEnv("api_url_external"); webconf.APIURLExternal == "" {
		webconf.APIURLExternal = "/api"
	}
	if webconf.APIURLInternal, _ = os.LookupEnv("api_url_internal"); webconf.APIURLInternal == "" {
		panic("internal API URL is required. Please set api_url_internal")
	}

	// Check debug mode. When debug mode is enabled debug logging will be
	// enabled, templates will be parsed on every request and analytics tracking
	// will be disabled
	switch d, _ := os.LookupEnv("debug_mode"); d {
	case "1", "yes", "y", "true":
		webconf.DebugMode = true
		log.SetLogLevel(log.LevelDebug)
	default:
		webconf.DebugMode = false
		log.SetLogLevel(log.LevelInfo)
	}

	// Web path prefix
	prefix, _ := os.LookupEnv("api_path_prefix")

	// Init the http router
	r := httprouter.New()
	webcontroller.New(r, prefix, webconf)

	err := http.ListenAndServe(":8081", r)
	if err != nil {
		log.Error("Can't listen and serve Pixeldrain Web: %v", err)
	}
}
