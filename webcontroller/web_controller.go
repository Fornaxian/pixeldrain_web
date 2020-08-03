package webcontroller

import (
	"bytes"
	"errors"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"strings"
	"time"

	"fornaxian.tech/pixeldrain_server/api/restapi/apiclient"
	"github.com/Fornaxian/log"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	blackfriday "github.com/russross/blackfriday/v2"
)

// WebController controls how requests are handled and makes sure they have
// proper context when running
type WebController struct {
	templates *TemplateManager

	resourceDir string

	hostname string

	apiURLInternal string
	apiURLExternal string

	sessionCookieDomain string

	// page-specific variables
	captchaSiteKey string

	httpClient *http.Client

	// This API client should only be used for system functions like getting
	// view tokens. It has no authentication and no IP forwarding
	systemPixelAPI *apiclient.PixelAPI
}

// New initializes a new WebController by registering all the request handlers
// and parsing all templates in the resource directory
func New(
	r *httprouter.Router,
	prefix string,
	resourceDir string,
	apiURLInternal string,
	apiURLExternal string,
	sessionCookieDomain string,
	maintenanceMode bool,
	debugMode bool,
) (wc *WebController) {
	var err error
	wc = &WebController{
		resourceDir:         resourceDir,
		apiURLInternal:      apiURLInternal,
		apiURLExternal:      apiURLExternal,
		sessionCookieDomain: sessionCookieDomain,
		httpClient:          &http.Client{Timeout: time.Minute * 10},
		systemPixelAPI:      apiclient.New(apiURLInternal),
	}
	wc.templates = NewTemplateManager(resourceDir, apiURLExternal, debugMode)
	wc.templates.ParseTemplates(false)

	if wc.hostname, err = os.Hostname(); err != nil {
		panic(fmt.Errorf("Could not get hostname: %s", err))
	}

	// Serve static files
	var fs = http.FileServer(http.Dir(resourceDir + "/static"))
	r.GET(prefix+"/res/*filepath", func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		// Cache resources for 4 weeks
		w.Header().Set("Cache-Control", "public, max-age=2419200")
		r.URL.Path = p.ByName("filepath")
		fs.ServeHTTP(w, r)
	})

	// Static assets
	r.GET(prefix+"/favicon.ico" /*  */, wc.serveFile("/favicon.ico"))
	r.GET(prefix+"/robots.txt" /*   */, wc.serveFile("/robots.txt"))

	if maintenanceMode {
		r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusServiceUnavailable)
			wc.templates.Get().ExecuteTemplate(w, "maintenance", wc.newTemplateData(w, r))
		})
		return wc
	}

	r.NotFound = http.HandlerFunc(wc.serveNotFound)

	// Request method shorthands. These help keep the array of handlers aligned
	const PST, GET, PUT, DEL = "POST", "GET", "PUT", "DELETE"

	// Loop over the handlers and register all of them in the router
	for _, h := range []struct {
		method  string            // HTTP request method this API handler uses
		path    string            // The URL path this API will be registered on
		handler httprouter.Handle // The function to run when this API is called
	}{
		// General navigation
		{GET, "" /*             */, wc.serveTemplate("home", false)},
		{GET, "api" /*          */, wc.serveMarkdown("apidoc.md", false)},
		{GET, "history" /*      */, wc.serveTemplate("history_cookies", false)},
		{GET, "u/:id" /*        */, wc.serveFileViewer},
		{GET, "u/:id/preview" /**/, wc.serveFilePreview},
		{GET, "l/:id" /*        */, wc.serveListViewer},
		{GET, "s/:id" /*        */, wc.serveSkynetViewer},
		{GET, "t" /*            */, wc.serveTemplate("paste", false)},
		{GET, "donation" /*     */, wc.serveMarkdown("donation.md", false)},
		{GET, "subscribe" /*    */, wc.serveMarkdown("subscribe.md", false)},
		{GET, "widgets" /*      */, wc.serveTemplate("widgets", false)},
		{GET, "about" /*        */, wc.serveMarkdown("about.md", false)},
		{GET, "appearance" /*   */, wc.serveTemplate("appearance", false)},

		// User account pages
		{GET, "register" /*        */, wc.serveForm(wc.registerForm, false)},
		{PST, "register" /*        */, wc.serveForm(wc.registerForm, false)},
		{GET, "login" /*           */, wc.serveForm(wc.loginForm, false)},
		{PST, "login" /*           */, wc.serveForm(wc.loginForm, false)},
		{GET, "password_reset" /*  */, wc.serveForm(wc.passwordResetForm, false)},
		{PST, "password_reset" /*  */, wc.serveForm(wc.passwordResetForm, false)},
		{GET, "logout" /*          */, wc.serveTemplate("logout", true)},
		{PST, "logout" /*          */, wc.serveLogout},
		{GET, "user" /*            */, wc.serveTemplate("user_home", true)},
		{GET, "user/files" /*      */, wc.serveTemplate("user_files", true)},
		{GET, "user/lists" /*      */, wc.serveTemplate("user_lists", true)},
		{GET, "user/filemanager" /**/, wc.serveTemplate("file_manager", true)},

		// User account settings
		{GET, "user/settings" /*              */, wc.serveUserSettings},
		{PST, "user/settings" /*              */, wc.serveUserSettings},
		{GET, "user/confirm_email" /*         */, wc.serveEmailConfirm},
		{GET, "user/password_reset_confirm" /**/, wc.serveForm(wc.passwordResetConfirmForm, false)},
		{PST, "user/password_reset_confirm" /**/, wc.serveForm(wc.passwordResetConfirmForm, false)},

		// Admin settings
		{GET, "admin" /*        */, wc.serveTemplate("admin_panel", true)},
		{GET, "admin/globals" /**/, wc.serveForm(wc.adminGlobalsForm, true)},
		{PST, "admin/globals" /**/, wc.serveForm(wc.adminGlobalsForm, true)},
		{GET, "admin/abuse" /*  */, wc.serveForm(wc.adminAbuseForm, true)},
		{PST, "admin/abuse" /*  */, wc.serveForm(wc.adminAbuseForm, true)},

		// Advertising related
		{GET, "click/:id" /*   */, wc.serveAdClick},
		{GET, "campaign/:id" /**/, wc.serveCampaignPartner},
	} {
		r.Handle(h.method, prefix+"/"+h.path, h.handler)
	}

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
		if err != nil && !strings.Contains(err.Error(), "broken pipe") {
			log.Error("Error executing template '%s': %s", tpl, err)
		}
	}
}

func (wc *WebController) serveMarkdown(tpl string, requireAuth bool) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		var err error
		var tpld = wc.newTemplateData(w, r)
		if requireAuth && !tpld.Authenticated {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		// Execute the raw markdown template and save the result in a buffer
		var tplBuf bytes.Buffer
		if err = wc.templates.Get().ExecuteTemplate(&tplBuf, tpl, tpld); err != nil {
			log.Error("Error executing template '%s': %s", tpl, err)
			return
		}

		// Parse the markdown document and save the resulting HTML in a buffer
		renderer := blackfriday.NewHTMLRenderer(blackfriday.HTMLRendererParameters{
			Flags: blackfriday.CommonHTMLFlags,
		})

		// We parse the markdown document, walk through the nodes. Extract the
		// title of the document, and the rest of the nodes are rendered like
		// normal
		var mdBuf bytes.Buffer
		var inHeader = false
		blackfriday.New(
			blackfriday.WithRenderer(renderer),
			blackfriday.WithExtensions(blackfriday.CommonExtensions),
		).Parse(
			tplBuf.Bytes(),
		).Walk(func(node *blackfriday.Node, entering bool) blackfriday.WalkStatus {
			// Capture the title of the document so we can put it at the top of
			// the template and in the metadata. When entering a h1 node the
			// next node will be the title of the document. Save that value
			if node.Type == blackfriday.Heading && node.HeadingData.Level == 1 {
				inHeader = entering
				return blackfriday.GoToNext
			}
			if inHeader {
				tpld.Title = string(node.Literal)
				log.Info(string(node.Literal))
				return blackfriday.GoToNext
			}

			return renderer.RenderNode(&mdBuf, node, entering)
		})

		// Pass the buffer's parsed contents to the wrapper template
		tpld.Other = template.HTML(mdBuf.Bytes())

		// Execute the wrapper template
		err = wc.templates.Get().ExecuteTemplate(w, "markdown_wrapper", tpld)
		if err != nil && !strings.Contains(err.Error(), "broken pipe") {
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
		http.ServeFile(w, r, wc.resourceDir+"/static"+path)
	}
}

func (wc *WebController) serveForm(
	handler func(*TemplateData, *http.Request) Form,
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
		td.Title = td.Form.Title
		td.Form.Username = td.User.Username

		// Execute the extra actions if any
		if td.Form.Extra.SetCookie != nil {
			w.Header().Del("Set-Cookie")
			http.SetCookie(w, td.Form.Extra.SetCookie)
		}
		if td.Form.Extra.RedirectTo != "" {
			http.Redirect(w, r, td.Form.Extra.RedirectTo, http.StatusSeeOther)
			log.Debug("redirect: %s", td.Form.Extra.RedirectTo)
			return // Don't need to render a form if the user is redirected
		}

		// Remove the recaptcha field if captcha is disabled
		if wc.captchaKey() == "none" {
			for i, field := range td.Form.Fields {
				if field.Type == FieldTypeCaptcha {
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
		} else if td.Form.Submitted {
			w.WriteHeader(http.StatusBadRequest)
		}

		err := wc.templates.Get().ExecuteTemplate(w, "form_page", td)
		if err != nil && !strings.Contains(err.Error(), "broken pipe") {
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
		var api = apiclient.New(wc.apiURLInternal)
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
