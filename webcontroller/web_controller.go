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
	"fornaxian.tech/util"
	"github.com/julienschmidt/httprouter"
	blackfriday "github.com/russross/blackfriday/v2"
)

type Config struct {
	APIURLExternal      string `toml:"api_url_external"`
	APIURLInternal      string `toml:"api_url_internal"`
	APISocketPath       string `toml:"api_socket_path"`
	SessionCookieDomain string `toml:"session_cookie_domain"`
	ResourceDir         string `toml:"resource_dir"`
	DebugMode           bool   `toml:"debug_mode"`
	ProxyAPIRequests    bool   `toml:"proxy_api_requests"`
	MaintenanceMode     bool   `toml:"maintenance_mode"`
}

// WebController controls how requests are handled and makes sure they have
// proper context when running
type WebController struct {
	templates *TemplateManager
	config    Config

	// Server hostname, displayed in the footer of every web page
	hostname string

	// page-specific variables
	captchaSiteKey string

	httpClient *http.Client

	// API client to use for all requests. If the user is authenticated you
	// should call Login() on this object. Calling Login will create a copy and
	// not alter the original PixelAPI, but it will use the same HTTP Transport
	api pixelapi.PixelAPI
}

// New initializes a new WebController by registering all the request handlers
// and parsing all templates in the resource directory
func New(r *httprouter.Router, prefix string, conf Config) (wc *WebController) {
	var err error
	wc = &WebController{
		config:     conf,
		httpClient: &http.Client{Timeout: time.Minute * 10},
		api:        pixelapi.New(conf.APIURLInternal),
	}

	if conf.APISocketPath != "" {
		wc.api = wc.api.UnixSocketPath(conf.APISocketPath)
	}

	wc.templates = NewTemplateManager(conf.ResourceDir, conf.APIURLExternal, conf.DebugMode)
	wc.templates.ParseTemplates(false)

	if wc.hostname, err = os.Hostname(); err != nil {
		panic(fmt.Errorf("could not get hostname: %s", err))
	}

	// Serve static files
	var fs = http.FileServer(http.Dir(conf.ResourceDir + "/static"))
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

	if conf.MaintenanceMode {
		r.NotFound = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusServiceUnavailable)
			wc.templates.Run(w, r, "maintenance", wc.newTemplateData(w, r))
		})
		return wc
	}

	if conf.ProxyAPIRequests {
		remoteURL, err := url.Parse(strings.TrimSuffix(conf.APIURLInternal, "/api"))
		if err != nil {
			panic(fmt.Errorf("failed to parse reverse proxy URL '%s': %w", conf.APIURLInternal, err))
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
	const PST, GET = "POST", "GET"

	// Loop over the handlers and register all of them in the router
	for _, h := range []struct {
		method  string            // HTTP request method this API handler uses
		path    string            // The URL path this API will be registered on
		handler httprouter.Handle // The function to run when this API is called
	}{
		// General navigation
		{GET, "" /*                */, wc.serveLandingPage()},
		{GET, "home" /*            */, wc.serveTemplate("home", handlerOpts{})},
		{GET, "api" /*             */, wc.serveMarkdown("api.md", handlerOpts{})},
		{GET, "history" /*         */, wc.serveTemplate("upload_history", handlerOpts{})},
		{GET, "u/:id" /*           */, wc.serveFileViewer},
		{GET, "u/:id/preview" /*   */, wc.serveFilePreview},
		{GET, "l/:id" /*           */, wc.serveListViewer},
		{GET, "d/*path" /*         */, wc.serveDirectory},
		{GET, "t" /*               */, wc.serveTemplate("text_upload", handlerOpts{})},
		{GET, "donation" /*        */, wc.serveMarkdown("donation.md", handlerOpts{})},
		{GET, "widgets" /*         */, wc.serveTemplate("widgets", handlerOpts{})},
		{GET, "about" /*           */, wc.serveMarkdown("about.md", handlerOpts{})},
		{GET, "appearance" /*      */, wc.serveTemplate("appearance", handlerOpts{})},
		{GET, "hosting" /*         */, wc.serveMarkdown("hosting.md", handlerOpts{})},
		{GET, "acknowledgements" /**/, wc.serveMarkdown("acknowledgements.md", handlerOpts{})},
		{GET, "business" /*        */, wc.serveMarkdown("business.md", handlerOpts{})},
		{GET, "limits" /*          */, wc.serveMarkdown("limits.md", handlerOpts{})},
		{GET, "abuse" /*           */, wc.serveMarkdown("abuse.md", handlerOpts{})},
		{GET, "filesystem" /*      */, wc.serveMarkdown("filesystem.md", handlerOpts{})},
		{GET, "100_gigabit_ethernet", wc.serveMarkdown("100_gigabit_ethernet.md", handlerOpts{NoExec: true})},
		{GET, "apps" /*            */, wc.serveTemplate("apps", handlerOpts{})},
		{GET, "speedtest" /*       */, wc.serveTemplate("speedtest", handlerOpts{})},
		{GET, "status" /*          */, wc.serveTemplate("status", handlerOpts{})},

		// User account pages
		{GET, "login" /*            */, wc.serveTemplate("login", handlerOpts{NoEmbed: true})},
		{GET, "register" /*         */, wc.serveTemplate("login", handlerOpts{NoEmbed: true})},
		{GET, "logout" /*           */, wc.serveTemplate("logout", handlerOpts{Auth: true, NoEmbed: true})},
		{PST, "logout" /*           */, wc.serveLogout},

		// User account settings
		{GET, "user/*p", wc.serveTemplate("user_home", handlerOpts{Auth: true, NoEmbed: true})},

		// Admin settings
		{GET, "admin", wc.serveTemplate("admin", handlerOpts{Auth: true})},
		{GET, "admin/*p", wc.serveTemplate("admin", handlerOpts{Auth: true})},

		// Misc
		{GET, "misc/sharex/pixeldrain.com.sxcu", wc.serveShareXConfig},
		{GET, "theme.css", wc.themeHandler},
	} {
		r.Handle(h.method, prefix+"/"+h.path, middleware(h.handler))

		// Also support HEAD requests
		if h.method == GET {
			r.HEAD(prefix+"/"+h.path, middleware(h.handler))
		}
	}

	return wc
}

func middleware(handle httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		// Redirect the user to the correct domain
		if hostname, found := strings.CutPrefix(r.Host, "www."); found {
			http.Redirect(
				w, r,
				"https://"+hostname+r.URL.String(),
				http.StatusMovedPermanently,
			)
			return
		}

		w.Header().Set("Strict-Transport-Security", "max-age=31536000")
		w.Header().Set("X-Clacks-Overhead", "GNU Terry Pratchett")
		handle(w, r, p)
	}
}

type handlerOpts struct {
	Auth    bool
	NoEmbed bool
	NoExec  bool
}

func (wc *WebController) serveLandingPage() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		var td = wc.newTemplateData(w, r)
		var template = "home"

		// If the user is logged in, run user home template
		if td.Authenticated {
			template = "user_home"
		}

		if err := wc.templates.Run(w, r, template, td); err != nil && !util.IsNetError(err) {
			log.Error("Error executing template '%s': %s", template, err)
		}
	}
}

func (wc *WebController) serveTemplate(tpl string, opts handlerOpts) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
		if opts.NoEmbed {
			w.Header().Set("X-Frame-Options", "DENY")
		}

		var td = wc.newTemplateData(w, r)
		if opts.Auth && !td.Authenticated {
			http.Redirect(w, r, "/login?redirect="+url.QueryEscape(r.URL.Path), http.StatusSeeOther)
			return
		}

		err := wc.templates.Run(w, r, tpl, td)
		if err != nil && !util.IsNetError(err) {
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
		err = wc.templates.Run(&tplBuf, r, tpl, tpld)
		if err != nil && !util.IsNetError(err) {
			log.Error("Error executing template '%s': %s", tpl, err)
			return
		}

		// Parse the markdown document and save the resulting HTML in a buffer
		renderer := blackfriday.NewHTMLRenderer(blackfriday.HTMLRendererParameters{
			Flags: blackfriday.CommonHTMLFlags | blackfriday.TOC,
		})

		// We parse the markdown document, walk through the nodes. Extract the
		// title of the document, and the rest of the nodes are rendered like
		// normal
		var mdBuf bytes.Buffer

		blackfriday.New(
			blackfriday.WithRenderer(renderer),
			blackfriday.WithExtensions(blackfriday.CommonExtensions|blackfriday.AutoHeadingIDs),
		).Parse(
			tplBuf.Bytes(),
		).Walk(func(node *blackfriday.Node, entering bool) blackfriday.WalkStatus {
			// Capture the title of the document so we can put it at the top of
			// the template and in the metadata. When entering a h1 node the
			// first child will be the title of the document. Save that value
			if node.Type == blackfriday.Heading && node.HeadingData.Level == 1 {
				tpld.Title = string(node.FirstChild.Literal)
				return blackfriday.SkipChildren
			}

			// If this text node contains solely the text "[TOC]" then we render
			// the table of contents
			if node.Type == blackfriday.Text && bytes.Equal(node.Literal, []byte("[TOC]")) {
				// Find the document node and render its TOC
				for parent := node.Parent; ; parent = parent.Parent {
					if parent.Type == blackfriday.Document {
						renderer.RenderHeader(&mdBuf, parent)
						return blackfriday.SkipChildren
					}
				}
			}

			return renderer.RenderNode(&mdBuf, node, entering)
		})

		// Pass the buffer's parsed contents to the wrapper template
		tpld.Other = template.HTML(mdBuf.Bytes())

		// Execute the wrapper template
		err = wc.templates.Run(w, r, "markdown_wrapper", tpld)
		if err != nil && !util.IsNetError(err) {
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
		http.ServeFile(w, r, wc.config.ResourceDir+"/static"+path)
	}
}

func (wc *WebController) serveForbidden(w http.ResponseWriter, r *http.Request) {
	log.Debug("Forbidden: %s", r.URL)
	w.WriteHeader(http.StatusForbidden)
	wc.templates.Run(w, r, "403", wc.newTemplateData(w, r))
}

func (wc *WebController) serveNotFound(w http.ResponseWriter, r *http.Request) {
	log.Debug("Not Found: %s", r.URL)
	w.WriteHeader(http.StatusNotFound)
	wc.templates.Run(w, r, "404", wc.newTemplateData(w, r))
}
func (wc *WebController) serveUnavailableForLegalReasons(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusUnavailableForLegalReasons)
	wc.templates.Run(w, r, "451", wc.newTemplateData(w, r))
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
