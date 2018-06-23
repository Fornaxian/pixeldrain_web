package webcontroller

import (
	"html/template"
	"net/http"
	"time"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
)

// TemplateData is a struct that every template expects when being rendered. In
// the field Other you can pass your own template-specific variables.
type TemplateData struct {
	Authenticated bool
	Username      string
	APIEndpoint   template.URL

	Recaptcha struct {
		Enabled bool
		PubKey  string
	}

	Other interface{}
}

func (wc *WebController) newTemplateData(w http.ResponseWriter, r *http.Request) *TemplateData {
	var t = &TemplateData{
		Authenticated: false,
		Username:      "Fornax",
		APIEndpoint:   template.URL(wc.conf.APIURLExternal),
	}

	if key, err := wc.getAPIKey(r); err == nil {
		var api = pixelapi.New(wc.conf.APIURLInternal, key)
		uinf, err := api.UserInfo()
		if err != nil {
			// This session key doesn't work, delete it
			log.Debug("Invalid API key '%s' passed", key)
			http.SetCookie(w, &http.Cookie{
				Name:    "pd_auth_key",
				Value:   "",
				Path:    "/",
				Expires: time.Unix(0, 0),
			})
			return t
		}

		// Authentication succeeded
		t.Authenticated = true
		t.Username = uinf.Username
	}

	return t
}
