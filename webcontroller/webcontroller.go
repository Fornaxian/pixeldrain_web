package webcontroller

import (
	"errors"
	"net/http"

	"github.com/google/uuid"

	"fornaxian.com/pixeldrain-web/init/conf"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

type WebController struct {
	conf              *conf.PixelWebConfig
	api               *pixelapi.PixelAPI // Shared instance, only used for unauthenticated requests
	templates         *templates.TemplateManager
	staticResourceDir string
}

func New(r *httprouter.Router, prefix string, conf *conf.PixelWebConfig) *WebController {
	var wc = &WebController{
		conf:              conf,
		staticResourceDir: conf.StaticResourceDir,
	}
	wc.api = pixelapi.New(conf.APIURLInternal, "")
	wc.templates = templates.New(
		conf.TemplateDir,
		conf.APIURLExternal,
		conf.DebugMode,
	)
	wc.templates.ParseTemplates(false)

	// Serve static files
	r.ServeFiles(prefix+"/res/*filepath", http.Dir(wc.staticResourceDir+"/res"))

	r.GET(prefix+"/" /*             */, wc.serveTemplate("home", false))
	r.GET(prefix+"/favicon.ico" /*  */, wc.serveFile("/favicon.ico"))
	r.GET(prefix+"/global.css" /*   */, wc.globalCSSHandler)
	r.GET(prefix+"/api" /*          */, wc.serveTemplate("apidoc", false))
	r.GET(prefix+"/history" /*      */, wc.serveTemplate("history_cookies", false))
	r.GET(prefix+"/u/:id" /*        */, wc.serveFileViewer)
	r.GET(prefix+"/u/:id/preview" /**/, wc.serveFilePreview)
	r.GET(prefix+"/l/:id" /*        */, wc.serveListViewer)
	r.GET(prefix+"/t" /*            */, wc.serveTemplate("paste", false))

	r.GET(prefix+"/register" /*     */, wc.serveTemplate("register", false))
	r.GET(prefix+"/login" /*        */, wc.serveTemplate("login", false))
	r.GET(prefix+"/logout" /*       */, wc.serveTemplate("logout", true))
	r.POST(prefix+"/logout" /*      */, wc.serveLogout)
	r.GET(prefix+"/user" /*         */, wc.serveTemplate("user_home", true))
	r.GET(prefix+"/user/files" /*   */, wc.serveTemplate("user_files", true))

	r.NotFound = http.HandlerFunc(wc.serveNotFound)

	return wc
}

func (wc *WebController) serveTemplate(
	tpl string,
	requireAuth bool,
) httprouter.Handle {
	return func(
		w http.ResponseWriter,
		r *http.Request,
		p httprouter.Params,
	) {
		var tpld = wc.newTemplateData(w, r)
		if requireAuth && !tpld.Authenticated {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		err := wc.templates.Get().ExecuteTemplate(w, tpl, tpld)
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
	wc.templates.Get().ExecuteTemplate(w, "404", wc.newTemplateData(w, r))
}

func (wc *WebController) getAPIKey(r *http.Request) (key string, err error) {
	if cookie, err := r.Cookie("pd_auth_key"); err == nil {
		if _, err := uuid.Parse(cookie.Value); err == nil {
			return cookie.Value, nil
		}
	}
	return "", errors.New("not a valid pixeldrain authentication cookie")
}
