package webcontroller

import (
	"errors"
	"net/http"

	"github.com/google/uuid"

	"fornaxian.com/pixeldrain-web/init/conf"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"fornaxian.com/pixeldrain-web/webcontroller/forms"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// WebController controls how requests are handled and makes sure they have
// proper context when running
type WebController struct {
	conf              *conf.PixelWebConfig
	templates         *TemplateManager
	staticResourceDir string

	// page-specific variables
	captchaSiteKey string
}

// New initializes a new WebController by registering all the request handlers
// and parsing all templates in the resource directory
func New(r *httprouter.Router, prefix string, conf *conf.PixelWebConfig) *WebController {
	var wc = &WebController{
		conf:              conf,
		staticResourceDir: conf.StaticResourceDir,
	}
	wc.templates = NewTemplateManager(
		conf.TemplateDir,
		conf.APIURLExternal,
		conf.DebugMode,
	)
	wc.templates.ParseTemplates(false)

	var p = prefix

	// Serve static files
	var fs = http.FileServer(http.Dir(wc.staticResourceDir))
	r.GET(p+"/res/*filepath", func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		w.Header().Set("Cache-Control", "public, max-age=86400") // Cache for one day
		r.URL.Path = p.ByName("filepath")
		fs.ServeHTTP(w, r)
	})

	// General navigation
	r.GET(p+"/" /*             */, wc.serveTemplate("home", false))
	r.GET(p+"/favicon.ico" /*  */, wc.serveFile("/favicon.ico"))
	r.GET(p+"/api" /*          */, wc.serveTemplate("apidoc", false))
	r.GET(p+"/history" /*      */, wc.serveTemplate("history_cookies", false))
	r.GET(p+"/u/:id" /*        */, wc.serveFileViewer)
	r.GET(p+"/u/:id/preview" /**/, wc.serveFilePreview)
	r.GET(p+"/l/:id" /*        */, wc.serveListViewer)
	r.GET(p+"/t" /*            */, wc.serveTemplate("paste", false))
	r.GET(p+"/donation" /*     */, wc.serveTemplate("donation", false))
	r.GET(p+"/widgets" /*      */, wc.serveTemplate("widgets", false))

	// User account pages
	r.GET(p+"/register_old" /*    */, wc.serveRegister)
	r.GET(p+"/register" /*        */, wc.serveForm(wc.registerForm, false))
	r.POST(p+"/register" /*       */, wc.serveForm(wc.registerForm, false))
	r.GET(p+"/login" /*           */, wc.serveTemplate("login", false))
	r.GET(p+"/logout" /*          */, wc.serveTemplate("logout", true))
	r.POST(p+"/logout" /*         */, wc.serveLogout)
	r.GET(p+"/user" /*            */, wc.serveTemplate("user_home", true))
	r.GET(p+"/user/files" /*      */, wc.serveTemplate("user_files", true))
	r.GET(p+"/user/lists" /*      */, wc.serveTemplate("user_lists", true))
	r.GET(p+"/user/filemanager" /**/, wc.serveTemplate("file_manager", true))

	// User account settings
	r.GET(p+"/user/settings" /*        */, wc.serveTemplate("user_settings", true))
	r.GET(p+"/user/change_password" /* */, wc.serveForm(wc.passwordForm, true))
	r.POST(p+"/user/change_password" /**/, wc.serveForm(wc.passwordForm, true))

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

func (wc *WebController) serveForm(
	handler func(*TemplateData, *http.Request) forms.Form,
	requireAuth bool,
) httprouter.Handle {
	return func(
		w http.ResponseWriter,
		r *http.Request,
		p httprouter.Params,
	) {
		var td = wc.newTemplateData(w, r)
		if requireAuth && !td.Authenticated {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		// The handler retuns the form which will be rendered
		td.Form = handler(td, r)

		td.Form.Username = td.Username

		// Remove the recaptcha field if captcha is disabled
		if wc.captchaSiteKey == "none" {
			for i, field := range td.Form.Fields {
				if field.Type == forms.FieldTypeCaptcha {
					td.Form.Fields = append(
						td.Form.Fields[:i],
						td.Form.Fields[i+1:]...,
					)
				}
			}
		}

		// Clear the entered values if the request was successful
		if td.Form.SubmitSuccess {
			w.WriteHeader(http.StatusOK)
			for i, field := range td.Form.Fields {
				field.EnteredValue = ""
				td.Form.Fields[i] = field
			}
		} else {
			w.WriteHeader(http.StatusBadRequest)
		}

		err := wc.templates.Get().ExecuteTemplate(w, "form_page", td)
		if err != nil {
			log.Error("Error executing form page: %s", err)
		}
	}
}

func (wc *WebController) serveNotFound(w http.ResponseWriter, r *http.Request) {
	log.Debug("Not Found: %s", r.URL)
	w.WriteHeader(http.StatusNotFound)
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

func (wc *WebController) captchaKey() string {
	// This only runs on the first request
	if wc.captchaSiteKey == "" {
		var api = pixelapi.New(wc.conf.APIURLInternal, "")
		capt, err := api.GetRecaptcha()
		if err != nil {
			log.Error("Error getting recaptcha key: %s", err)
			return ""
		}
		if capt.SiteKey == "" {
			wc.captchaSiteKey = "none"
		} else {
			wc.captchaSiteKey = capt.SiteKey
		}
	}

	return wc.captchaSiteKey
}
