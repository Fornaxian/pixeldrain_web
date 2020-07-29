package webcontroller

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"fornaxian.tech/pixeldrain_server/api/restapi/apiclient"
	"fornaxian.tech/pixeldrain_server/api/restapi/apitype"
	"fornaxian.tech/pixeldrain_server/util"
	"github.com/Fornaxian/log"
)

// TemplateData is a struct that every template expects when being rendered. In
// the field Other you can pass your own template-specific variables.
type TemplateData struct {
	Authenticated bool
	User          apitype.UserInfo
	UserAgent     string
	Style         pixeldrainStyleSheet
	UserStyle     template.CSS
	APIEndpoint   template.URL
	PixelAPI      *apiclient.PixelAPI
	Hostname      template.HTML

	// Only used on file viewer page
	Title  string
	OGData template.HTML

	Other    interface{}
	URLQuery url.Values

	// Only used for pages containing forms
	Form Form
}

func (wc *WebController) newTemplateData(w http.ResponseWriter, r *http.Request) (t *TemplateData) {
	t = &TemplateData{
		Authenticated: false,
		UserAgent:     r.UserAgent(),
		Style:         userStyle(r),
		UserStyle:     template.CSS(userStyle(r).String()),
		APIEndpoint:   template.URL(wc.apiURLExternal),
		PixelAPI:      apiclient.New(wc.apiURLInternal),
		Hostname:      template.HTML(wc.hostname),
		URLQuery:      r.URL.Query(),
	}

	// Use the user's IP address for making requests
	t.PixelAPI.RealIP = util.RemoteAddress(r)

	// If the user is authenticated we'll indentify him and put the user info
	// into the templatedata. This is used for putting the username in the menu
	// and stuff like that
	if key, err := wc.getAPIKey(r); err == nil {
		t.PixelAPI.APIKey = key // Use the user's API key for all requests
		t.User, err = t.PixelAPI.UserInfo()
		if err != nil {
			// This session key doesn't work, or the backend is down, user
			// cannot be authenticated
			log.Debug("Session check for key '%s' failed: %s", key, err)

			if err.Error() == "authentication_required" || err.Error() == "authentication_failed" {
				// Disable API authentication
				t.PixelAPI.APIKey = ""

				// Remove the authentication cookie
				log.Debug("Deleting invalid API key")
				http.SetCookie(w, &http.Cookie{
					Name:    "pd_auth_key",
					Value:   "",
					Path:    "/",
					Expires: time.Unix(0, 0),
					Domain:  wc.sessionCookieDomain,
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
		"bgPattern":  tm.bgPattern,
		"isBrave":    tm.isBrave,
		"debugMode":  tm.debugMode,
		"apiUrl":     tm.apiURL,
		"pageNr":     tm.pageNr,
		"add":        tm.add,
		"sub":        tm.sub,
		"formatData": tm.formatData,
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
		if f == nil || f.IsDir() {
			return nil
		}

		if file, err = ioutil.ReadFile(path); err != nil {
			return err
		}

		if strings.HasSuffix(path, ".png") {
			file = []byte("data:image/png;base64," + base64.StdEncoding.EncodeToString(file))
		} else if strings.HasSuffix(path, ".gif") {
			file = []byte("data:image/gif;base64," + base64.StdEncoding.EncodeToString(file))
		}
		// Wrap the resources in a template definition
		if _, err = tpl.Parse(
			`{{define "` + f.Name() + `"}}` + string(file) + `{{end}}`,
		); err != nil {
			return err
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

// Get returns the templates, so they can be used to render views
func (tm *TemplateManager) Get() *template.Template {
	if tm.debugModeEnabled {
		tm.ParseTemplates(true)
	}
	return tm.tpl
}

// Templace functions. These can be called from within the template to execute
// more specialized actions

func (tm *TemplateManager) bgPattern() template.URL {
	var now = time.Now()
	var file string
	if now.Weekday() == time.Wednesday && now.UnixNano()%10 == 0 {
		file = "checker_wednesday.png"
	} else {
		file = fmt.Sprintf("checker%d.png", now.UnixNano()%17)
	}

	var buf = bytes.Buffer{}
	if err := tm.tpl.ExecuteTemplate(&buf, file, nil); err != nil {
		panic(err)
	}
	return template.URL(buf.String())
}
func (tm *TemplateManager) isBrave(useragent string) bool {
	return strings.Contains(useragent, "Brave")
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
func (tm *TemplateManager) add(a, b interface{}) int {
	return detectInt(a) + detectInt(b)
}
func (tm *TemplateManager) sub(a, b interface{}) int {
	return detectInt(a) - detectInt(b)
}
func (tm *TemplateManager) formatData(i interface{}) string {
	return util.FormatData(int64(detectInt(i)))
}

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
	}
	panic(fmt.Sprintf("%v is not an int", i))
}
