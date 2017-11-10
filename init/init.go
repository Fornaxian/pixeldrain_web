package init

import (
	"net/http"
	"os"

	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/webcontroller"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/julienschmidt/httprouter"
)

// Init initializes the Pixeldrain Web UI controllers
func Init(r *httprouter.Router, prefix string) {
	log.Init()
	log.Info("Starting web UI server (PID %v)", os.Getpid())
	conf.Init()

	templates.ParseTemplates()

	// Serve static files
	r.ServeFiles(prefix+"/res/*filepath", http.Dir(conf.StaticResourceDir()+"/res"))

	r.GET(prefix+"/", webcontroller.ServeHome)
	r.GET(prefix+"/favicon.ico", webcontroller.ServeFavicon)
	r.GET(prefix+"/api", webcontroller.ServeAPIDoc)
	r.GET(prefix+"/history", webcontroller.ServeHistory)
	r.GET(prefix+"/u/:id", webcontroller.ServeFileViewer)
	r.GET(prefix+"/u/:id/preview", webcontroller.ServeFilePreview)
	r.GET(prefix+"/t", webcontroller.ServePaste)

	r.NotFound = http.HandlerFunc(webcontroller.ServeNotFound)
}
