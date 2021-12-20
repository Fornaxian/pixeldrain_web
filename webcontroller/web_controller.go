package webcontroller

import (
	"bytes"
	"errors"
	"fmt"
	"html/template"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"github.com/julienschmidt/httprouter"
	blackfriday "github.com/russross/blackfriday/v2"
)

// WebController controls how requests are handled and makes sure they have
// proper context when running
type WebController struct {
	templates *TemplateManager

	resourceDir string

	hostname string

	apiURLInternal      string
	apiURLExternal      string
	websiteAddress      string
	sessionCookieDomain string
	proxyAPIRequests    bool

	// page-specific variables
	captchaSiteKey string

	// The cache ID is used to invalidate caches when the webserver is restarted
	cacheID int64

	httpClient *http.Client

	// API client to use for all requests. If the user is authenticated you
	// should call Login() on this object. Calling Login will create a copy and
	// not alter the original PixelAPI, but it will use the same HTTP Transport
	api pixelapi.PixelAPI
}

// New initializes a new WebController by registering all the request handlers
// and parsing all templates in the resource directory
func New(
	r *httprouter.Router,
	prefix string,
	resourceDir string,
	apiURLInternal string,
	apiURLExternal string,
	websiteAddress string,
	sessionCookieDomain string,
	maintenanceMode bool,
	debugMode bool,
	proxyAPIRequests bool,
) (wc *WebController) {
	var err error
	wc = &WebController{
		resourceDir:         resourceDir,
		apiURLInternal:      apiURLInternal,
		apiURLExternal:      apiURLExternal,
		websiteAddress:      websiteAddress,
		sessionCookieDomain: sessionCookieDomain,
		proxyAPIRequests:    proxyAPIRequests,
		cacheID:             time.Now().Unix() / 3600,
		httpClient:          &http.Client{Timeout: time.Minute * 10},
		api:                 pixelapi.New(apiURLInternal),
	}
	wc.templates = NewTemplateManager(resourceDir, apiURLExternal, debugMode)
	wc.templates.ParseTemplates(false)

	if wc.hostname, err = os.Hostname(); err != nil {
		panic(fmt.Errorf("could not get hostname: %s", err))
	}

	// Serve static files
	var fs = http.FileServer(http.Dir(resourceDir + "/static"))
	var resourceHandler = func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		// Cache resources for a year
		w.Header().Set("Cache-Control", "public, max-age=31536000")
		r.URL.Path = p.ByName("filepath")
		fs.ServeHTTP(w, r)
	}
	r.HEAD(prefix+"/res/*filepath", resourceHandler)
	r.OPTIONS(prefix+"/res/*filepath", resourceHandler)
	r.GET(prefix+"/res/*filepath", resourceHandler)

	// Static assets
	r.GET(prefix+"/favicon.ico" /*  */, wc.serveFile("/favicon.ico"))
	r.GET(prefix+"/robots.txt" /*   */, wc.serveFile("/robots.txt"))
	r.GET(prefix+"/ads.txt" /*      */, wc.serveFile("/ads.txt"))

	if maintenanceMode {
		r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusServiceUnavailable)
			wc.templates.Get().ExecuteTemplate(w, "maintenance", wc.newTemplateData(w, r))
		})
		return wc
	}

	if proxyAPIRequests {
		remoteURL, err := url.Parse(strings.TrimSuffix(apiURLInternal, "/api"))
		if err != nil {
			panic(fmt.Errorf("failed to parse reverse proxy URL '%s': %w", apiURLInternal, err))
		}

		log.Info("Starting API proxy to %s", remoteURL)
		var prox = httputil.NewSingleHostReverseProxy(remoteURL)
		prox.Transport = wc.httpClient.Transport

		var proxyHandler = func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
			log.Info("Proxying request to %s", r.URL)
			r.Host = remoteURL.Host
			r.Header.Set("Origin", remoteURL.String())
			prox.ServeHTTP(w, r)
		}

		r.Handle("OPTIONS", "/api/*p", proxyHandler)
		r.Handle("POST", "/api/*p", proxyHandler)
		r.Handle("GET", "/api/*p", proxyHandler)
		r.Handle("PUT", "/api/*p", proxyHandler)
		r.Handle("PATCH", "/api/*p", proxyHandler)
		r.Handle("DELETE", "/api/*p", proxyHandler)
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
		{GET, "" /*                */, wc.serveTemplate("home", handlerOpts{})},
		{GET, "api" /*             */, wc.serveMarkdown("api.md", handlerOpts{})},
		{GET, "history" /*         */, wc.serveTemplate("history_cookies", handlerOpts{})},
		{GET, "u/:id/preview" /*   */, wc.serveFilePreview},
		{GET, "u/:id" /*           */, wc.serveFileViewer},
		{GET, "l/:id" /*           */, wc.serveListViewer},
		{GET, "d/*path" /*         */, wc.serveDirectory},
		{GET, "t" /*               */, wc.serveTemplate("text_editor", handlerOpts{})},
		{GET, "donation" /*        */, wc.serveMarkdown("donation.md", handlerOpts{})},
		{GET, "advertising" /*     */, wc.serveMarkdown("advertising.md", handlerOpts{})},
		{GET, "widgets" /*         */, wc.serveTemplate("widgets", handlerOpts{})},
		{GET, "about" /*           */, wc.serveMarkdown("about.md", handlerOpts{})},
		{GET, "appearance" /*      */, wc.serveTemplate("appearance", handlerOpts{})},
		{GET, "hosting" /*         */, wc.serveMarkdown("hosting.md", handlerOpts{})},
		{GET, "brave" /*           */, wc.serveMarkdown("brave.md", handlerOpts{})},
		{GET, "acknowledgements" /**/, wc.serveMarkdown("acknowledgements.md", handlerOpts{})},
		{GET, "business" /*        */, wc.serveMarkdown("business.md", handlerOpts{})},
		{GET, "server_status" /*   */, wc.serveTemplate("server_status", handlerOpts{})},
		{GET, "apps" /*            */, wc.serveTemplate("apps", handlerOpts{})},

		// User account pages
		{GET, "register" /*         */, wc.serveForm(wc.registerForm, handlerOpts{NoEmbed: true})},
		{PST, "register" /*         */, wc.serveForm(wc.registerForm, handlerOpts{NoEmbed: true})},
		{GET, "login" /*            */, wc.serveForm(wc.loginForm, handlerOpts{NoEmbed: true})},
		{PST, "login" /*            */, wc.serveForm(wc.loginForm, handlerOpts{NoEmbed: true})},
		{GET, "password_reset" /*   */, wc.serveForm(wc.passwordResetForm, handlerOpts{NoEmbed: true})},
		{PST, "password_reset" /*   */, wc.serveForm(wc.passwordResetForm, handlerOpts{NoEmbed: true})},
		{GET, "logout" /*           */, wc.serveTemplate("logout", handlerOpts{Auth: true, NoEmbed: true})},
		{PST, "logout" /*           */, wc.serveLogout},
		{GET, "user/buckets" /*     */, wc.serveTemplate("user_buckets", handlerOpts{Auth: true})},
		{GET, "user/filemanager" /* */, wc.serveTemplate("file_manager", handlerOpts{Auth: true})},
		{GET, "user/export/files" /**/, wc.serveUserExportFiles},
		{GET, "user/export/lists" /**/, wc.serveUserExportLists},

		// User account settings
		{GET, "user" /*                       */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/home" /*                  */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/settings" /*              */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/api_keys" /*              */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/connect_app" /*           */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/transactions" /*          */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/subscription" /*          */, wc.serveTemplate("user_home", handlerOpts{Auth: true})},
		{GET, "user/confirm_email" /*         */, wc.serveEmailConfirm},
		{GET, "user/password_reset_confirm" /**/, wc.serveForm(wc.passwordResetConfirmForm, handlerOpts{NoEmbed: true})},
		{PST, "user/password_reset_confirm" /**/, wc.serveForm(wc.passwordResetConfirmForm, handlerOpts{NoEmbed: true})},

		{GET, "patreon_activate", wc.serveForm(wc.patreonLinkForm, handlerOpts{Auth: true})},
		{PST, "patreon_activate", wc.serveForm(wc.patreonLinkForm, handlerOpts{Auth: true})},

		{GET, "knoxfs_activate", wc.serveForm(wc.knoxfsLinkForm, handlerOpts{Auth: true})},
		{PST, "knoxfs_activate", wc.serveForm(wc.knoxfsLinkForm, handlerOpts{Auth: true})},

		{GET, "coupon_redeem", wc.serveForm(wc.couponForm, handlerOpts{})},
		{PST, "coupon_redeem", wc.serveForm(wc.couponForm, handlerOpts{})},

		// Admin settings
		{GET, "admin" /*                */, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/status" /*         */, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/block_files" /*    */, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/abuse_reporters" /**/, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/abuse_reports" /*  */, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/ip_bans" /*        */, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/subscriptions" /*  */, wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/globals" /*        */, wc.serveForm(wc.adminGlobalsForm, handlerOpts{Auth: true})},
		{PST, "admin/globals" /*        */, wc.serveForm(wc.adminGlobalsForm, handlerOpts{Auth: true})},

		// Advertising related
		{GET, "click/:id" /*     */, wc.serveAdClick},
		{GET, "campaign/:id" /*  */, wc.serveCampaignPartner},

		// Misc
		{GET, "misc/sharex/pixeldrain.com.sxcu", wc.serveShareXConfig},
	} {
		r.Handle(h.method, prefix+"/"+h.path, h.handler)
	}

	return wc
}

type handlerOpts struct {
	Auth    bool
	NoEmbed bool
}

func (wc *WebController) serveTemplate(tpl string, opts handlerOpts) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		if opts.NoEmbed {
			w.Header().Set("X-Frame-Options", "DENY")
		}

		var td = wc.newTemplateData(w, r)
		if opts.Auth && !td.Authenticated {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		err := wc.templates.Get().ExecuteTemplate(w, tpl, td)
		if err != nil && !strings.Contains(err.Error(), "broken pipe") {
			log.Error("Error executing template '%s': %s", tpl, err)
		}
	}
}

func (wc *WebController) serveMarkdown(tpl string, opts handlerOpts) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		var err error
		if opts.NoEmbed {
			w.Header().Set("X-Frame-Options", "DENY")
		}

		var tpld = wc.newTemplateData(w, r)
		if opts.Auth && !tpld.Authenticated {
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
			blackfriday.WithExtensions(blackfriday.CommonExtensions|blackfriday.AutoHeadingIDs),
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
	opts handlerOpts,
) httprouter.Handle {
	return func(
		w http.ResponseWriter,
		r *http.Request,
		p httprouter.Params,
	) {
		if opts.NoEmbed {
			w.Header().Set("X-Frame-Options", "DENY")
		}

		var td = wc.newTemplateData(w, r)
		if opts.Auth && !td.Authenticated {
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
		if len(cookie.Value) == 36 {
			return cookie.Value, nil
		}
	}
	return "", errors.New("not a valid pixeldrain authentication cookie")
}

func (wc *WebController) captchaKey() string {
	// This only runs on the first request
	if wc.captchaSiteKey == "" {
		capt, err := wc.api.GetMiscRecaptcha()
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
