package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/init/conf"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

type WebController struct {
	conf              *conf.PixelWebConfig
	api               *pixelapi.PixelAPI
	templates         *templates.TemplateManager
	staticResourceDir string
}

func New(r *httprouter.Router, prefix string, conf *conf.PixelWebConfig) *WebController {
	var wc = &WebController{
		conf:              conf,
		staticResourceDir: conf.StaticResourceDir,
	}
	wc.api = pixelapi.New(conf.APIURLInternal)
	wc.templates = templates.New(
		conf.TemplateDir,
		conf.APIURLExternal,
		conf.DebugMode,
	)
	wc.templates.ParseTemplates(false)

	// Serve static files
	r.ServeFiles(prefix+"/res/*filepath", http.Dir(wc.staticResourceDir+"/res"))

	r.GET(prefix+"/" /*             */, wc.serveTemplate("home"))
	r.GET(prefix+"/favicon.ico" /*  */, wc.serveFile("/favicon.ico"))
	r.GET(prefix+"/global.css" /*   */, wc.globalCSSHandler)
	r.GET(prefix+"/api" /*          */, wc.serveTemplate("apidoc"))
	r.GET(prefix+"/history" /*      */, wc.serveTemplate("history-cookies"))
	r.GET(prefix+"/u/:id" /*        */, wc.serveFileViewer)
	r.GET(prefix+"/u/:id/preview" /**/, wc.serveFilePreview)
	r.GET(prefix+"/l/:id" /*        */, wc.serveListViewer)
	r.GET(prefix+"/t" /*            */, wc.serveTemplate("paste"))

	r.GET(prefix+"/register" /*     */, wc.serveTemplate("register"))
	r.GET(prefix+"/login" /*        */, wc.serveTemplate("login"))

	r.NotFound = http.HandlerFunc(wc.serveNotFound)

	return wc
}

func (wc *WebController) ReloadTemplates() {
	wc.templates.ParseTemplates(false)
}

func (wc *WebController) serveTemplate(tpl string) httprouter.Handle {
	return func(
		w http.ResponseWriter,
		r *http.Request,
		p httprouter.Params,
	) {
		err := wc.templates.Get().ExecuteTemplate(w, tpl, nil)
		if err != nil {
			log.Error("Error executing template '%s': %s", tpl, err)
		}
	}
}

func (wc *WebController) serveFile(path string) httprouter.Handle {
	return func(
		w http.ResponseWriter,
		r *http.Request,
		p httprouter.Params,
	) {
		http.ServeFile(w, r, wc.staticResourceDir+"/favicon.ico")
	}
}

func (wc *WebController) serveNotFound(w http.ResponseWriter, r *http.Request) {
	log.Debug("Not Found: %s", r.URL)
	wc.templates.Get().ExecuteTemplate(w, "error", nil)
}
