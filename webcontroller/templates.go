package webcontroller

import (
	"encoding/base64"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"fornaxian.tech/util"
)

// TemplateData is a struct that every template expects when being rendered. In
// the field Other you can pass your own template-specific variables.
type TemplateData struct {
	tpm           *TemplateManager
	Authenticated bool
	User          pixelapi.UserInfo
	UserAgent     string
	APIEndpoint   template.URL
	PixelAPI      pixelapi.PixelAPI
	Hostname      template.HTML

	// Only used on file viewer page
	Title  string
	OGData ogData

	Other    interface{}
	URLQuery url.Values
}

func (wc *WebController) newTemplateData(w http.ResponseWriter, r *http.Request) (t *TemplateData) {
	t = &TemplateData{
		tpm:           wc.templates,
		Authenticated: false,
		UserAgent:     r.UserAgent(),
		APIEndpoint:   template.URL(wc.config.APIURLExternal),

		// Use the user's IP address for making requests
		PixelAPI: wc.api.RealIP(util.RemoteAddress(r)).RealAgent(r.UserAgent()),

		Hostname: template.HTML(wc.hostname),
		URLQuery: r.URL.Query(),
	}

	// If the user is authenticated we'll indentify him and put the user info
	// into the templatedata. This is used for putting the username in the menu
	// and stuff like that
	if key, err := wc.getAPIKey(r); err == nil {
		t.PixelAPI = t.PixelAPI.Login(key) // Use the user's API key for all requests
		if t.User, err = t.PixelAPI.GetUser(); err != nil {
			// This session key doesn't work, or the backend is down, user
			// cannot be authenticated
			log.Debug("Session check for key '%s' failed: %s", key, err)

			if err.Error() == "authentication_required" || err.Error() == "authentication_failed" {
				// Disable API authentication
				t.PixelAPI = wc.api.RealIP(util.RemoteAddress(r)).RealAgent(r.UserAgent())

				// Remove the authentication cookie
				log.Debug("Deleting invalid API key")
				http.SetCookie(w, &http.Cookie{
					Name:    "pd_auth_key",
					Value:   "",
					Path:    "/",
					Expires: time.Unix(0, 0),
					Domain:  wc.config.SessionCookieDomain,
				})
				http.SetCookie(w, &http.Cookie{
					Name:    "pd_auth_key",
					Value:   "",
					Path:    "/",
					Expires: time.Unix(0, 0),
					Domain:  ".pixeldrain.com",
				})
			}
			return t
		}

		// Authentication succeeded
		t.Authenticated = true
	}

	return t
}

// TemplateManager parses templates and provides utility functions to the
// templates' scripting language
type TemplateManager struct {
	tpl *template.Template

	// Config
	resourceDir         string
	externalAPIEndpoint string
	debugModeEnabled    bool
}

// NewTemplateManager creates a new template manager
func NewTemplateManager(resourceDir, externalAPIEndpoint string, debugMode bool) *TemplateManager {
	return &TemplateManager{
		resourceDir:         resourceDir,
		externalAPIEndpoint: externalAPIEndpoint,
		debugModeEnabled:    debugMode,
	}
}

// ParseTemplates parses the templates in the template directory which is
// defined in the config file.
// If silent is false it will print an info log message for every template found
func (tm *TemplateManager) ParseTemplates(silent bool) {
	var err error
	var templatePaths []string
	tpl := template.New("")

	// Import template functions
	tpl.Funcs(template.FuncMap{
		"cacheID":        tm.cacheID,
		"debugMode":      tm.debugMode,
		"apiUrl":         tm.apiURL,
		"pageNr":         tm.pageNr,
		"add":            tm.add,
		"sub":            tm.sub,
		"mul":            tm.mul,
		"div":            tm.div,
		"formatData":     tm.formatData,
		"formatDataBits": tm.formatDataBits,
		"formatSC":       tm.formatSC,
		"noescape":       tm.noEscape,
		"noescapeJS":     tm.noEscapeJS,
		"slashes":        tm.slashes,
	})

	// Parse dynamic templates
	if err = filepath.Walk(tm.resourceDir+"/template", func(path string, f os.FileInfo, err error) error {
		if f == nil || f.IsDir() {
			return nil
		}

		templatePaths = append(templatePaths, path)
		if !silent {
			log.Info("Template found: %s", path)
		}
		return nil
	}); err != nil {
		log.Error("Failed to parse templates: %s", err)
	}
	if _, err = tpl.ParseFiles(templatePaths...); err != nil {
		log.Error("Template parsing failed: %v", err)
	}

	// Parse static resources
	var file []byte
	if err = filepath.Walk(tm.resourceDir+"/include", func(path string, f os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("walk err: %w", err)
		}
		if f == nil || f.IsDir() {
			return nil
		}

		if file, err = os.ReadFile(path); err != nil {
			return err
		}

		if strings.HasSuffix(path, ".png") {
			file = []byte("data:image/png;base64," + base64.StdEncoding.EncodeToString(file))
		} else if strings.HasSuffix(path, ".gif") {
			file = []byte("data:image/gif;base64," + base64.StdEncoding.EncodeToString(file))
		} else if strings.HasSuffix(path, ".webp") {
			file = []byte("data:image/webp;base64," + base64.StdEncoding.EncodeToString(file))
		}

		// Wrap the resources in a template definition
		if _, err = tpl.Parse(
			`{{define "` + f.Name() + `"}}` + string(file) + `{{end}}`,
		); err != nil {
			return fmt.Errorf("failed to parse '%s': %w", path, err)
		}

		if !silent {
			log.Info("Template parsed: %s", path)
		}

		return nil
	}); err != nil {
		log.Error("Failed to parse templates: %s", err)
	}

	tm.tpl = tpl
}

// Run runs a template by name
func (tm *TemplateManager) Run(w io.Writer, r *http.Request, name string, data any) (err error) {
	if tm.debugModeEnabled {
		tm.ParseTemplates(true)
	}
	if r.Method == "HEAD" {
		return nil
	}
	return tm.tpl.ExecuteTemplate(w, name, data)
}

// Template functions. These can be called from within the template to execute
// more specialized actions

// The cache ID is used to invalidate caches when the webserver is restarted.
// It's rounded to a full hour to prevent cached from being emptied too often if
// the server is regularly restarted
var cacheID = time.Now().Unix() / 3600

func (tm *TemplateManager) cacheID() int64 {
	return cacheID
}
func (tm *TemplateManager) debugMode() bool {
	return tm.debugModeEnabled
}
func (tm *TemplateManager) apiURL() string {
	return tm.externalAPIEndpoint
}
func (tm *TemplateManager) pageNr(s string) (nr int) {
	// Atoi returns 0 on error, which is fine for page numbers
	if nr, _ = strconv.Atoi(s); nr < 0 {
		return 0
	}
	return nr
}
func (tm *TemplateManager) add(a, b interface{}) float64 { return toFloat(a) + toFloat(b) }
func (tm *TemplateManager) sub(a, b interface{}) float64 { return toFloat(a) - toFloat(b) }
func (tm *TemplateManager) mul(a, b interface{}) float64 { return toFloat(a) * toFloat(b) }
func (tm *TemplateManager) div(a, b interface{}) float64 { return toFloat(a) / toFloat(b) }

func (tm *TemplateManager) formatData(i interface{}) string {
	return util.FormatData(detectInt(i))
}
func (tm *TemplateManager) formatDataBits(i interface{}) string {
	var size = detectInt(i) * 8
	var sizef = float64(size)

	var fmtSize = func(n float64, u string) string {
		var f string
		if n >= 100 {
			f = "%.1f"
		} else if n >= 10 {
			f = "%.2f"
		} else {
			f = "%.3f"
		}
		return fmt.Sprintf(f+" "+u, n)
	}

	if size >= 1e18 {
		// An exabyte is the largest volume of data you can express in a signed
		// 64-bit integer
		return fmtSize(sizef/1e18, "Eb")
	} else if sizef >= 1e15 {
		return fmtSize(sizef/1e15, "Pb")
	} else if sizef >= 1e12 {
		return fmtSize(sizef/1e12, "Tb")
	} else if sizef >= 1e9 {
		return fmtSize(sizef/1e9, "Gb")
	} else if sizef >= 1e6 {
		return fmtSize(sizef/1e6, "Mb")
	} else if sizef >= 1e3 {
		return fmtSize(sizef/1e3, "kb")
	}
	return fmt.Sprintf("%.0f b", sizef)
}
func (tm *TemplateManager) formatSC(amt float64) string {
	var fmtSize = func(n float64, u string) string {
		var f string
		if n >= 100 {
			f = "%.1f"
		} else if n >= 10 {
			f = "%.2f"
		} else {
			f = "%.3f"
		}
		return fmt.Sprintf(f+" "+u, n)
	}
	if amt >= 1 {
		return fmtSize(amt, "SC")
	} else if amt >= 1e-3 {
		return fmtSize(amt/1e-3, "mS")
	} else if amt >= 1e-6 {
		return fmtSize(amt/1e-6, "μS")
	} else if amt >= 1e-9 {
		return fmtSize(amt/1e-9, "nS")
	} else if amt >= 1e-12 {
		return fmtSize(amt/1e-12, "pS")
	}
	return fmtSize(amt/1e-24, "H")
}
func (tm *TemplateManager) noEscape(t string) template.HTML { return template.HTML(t) }
func (tm *TemplateManager) noEscapeJS(t string) template.JS { return template.JS(t) }
func (tm *TemplateManager) slashes() template.HTML          { return template.HTML("//") }

func detectInt(i interface{}) int {
	switch v := i.(type) {
	case int:
		return int(v)
	case int8:
		return int(v)
	case int16:
		return int(v)
	case int32:
		return int(v)
	case int64:
		return int(v)
	case uint:
		return int(v)
	case uint8:
		return int(v)
	case uint16:
		return int(v)
	case uint32:
		return int(v)
	case uint64:
		return int(v)
	case float32:
		return int(v)
	case float64:
		return int(v)
	}
	panic(fmt.Sprintf("%v is not an int", i))
}

func toFloat(i interface{}) float64 {
	switch v := i.(type) {
	case int:
		return float64(v)
	case int8:
		return float64(v)
	case int16:
		return float64(v)
	case int32:
		return float64(v)
	case int64:
		return float64(v)
	case uint:
		return float64(v)
	case uint8:
		return float64(v)
	case uint16:
		return float64(v)
	case uint32:
		return float64(v)
	case uint64:
		return float64(v)
	case float32:
		return float64(v)
	case float64:
		return float64(v)
	}
	panic(fmt.Sprintf("%v is not a number", i))
}
