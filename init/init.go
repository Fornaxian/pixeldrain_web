package init

import (
	"os"

	"fornaxian.com/pixeldrain-web/init/conf"
	"fornaxian.com/pixeldrain-web/webcontroller"
	"github.com/Fornaxian/config"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// Init initializes the Pixeldrain Web UI controllers
func Init(r *httprouter.Router, prefix string) {
	log.Info("Starting web UI server (PID %v)", os.Getpid())

	var webconf = &conf.PixelWebConfig{}
	var _, err = config.New(
		conf.DefaultConfig,
		"",
		"pdwebconf.toml",
		webconf,
		true,
	)
	if err != nil {
		log.Error("Failed to load config file: %s", err)
		os.Exit(1)
	}

	webcontroller.New(r, prefix, webconf)
}
