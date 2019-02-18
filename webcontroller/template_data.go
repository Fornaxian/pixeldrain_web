package webcontroller

import (
	"html/template"
	"net/http"
	"net/url"
	"time"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
)

// TemplateData is a struct that every template expects when being rendered. In
// the field Other you can pass your own template-specific variables.
type TemplateData struct {
	Authenticated bool
	Username      string
	UserStyle     template.CSS
	APIEndpoint   template.URL
	PixelAPI      *pixelapi.PixelAPI

	Other    interface{}
	URLQuery url.Values
	Title    string
}

func (wc *WebController) newTemplateData(w http.ResponseWriter, r *http.Request) *TemplateData {
	var t = &TemplateData{
		Authenticated: false,
		Username:      "",
		UserStyle:     userStyle(r),
		APIEndpoint:   template.URL(wc.conf.APIURLExternal),
		URLQuery:      r.URL.Query(),
	}

	if key, err := wc.getAPIKey(r); err == nil {
		t.PixelAPI = pixelapi.New(wc.conf.APIURLInternal, key)
		uinf, err := t.PixelAPI.UserInfo()
		if err != nil {
			// This session key doesn't work, delete it
			log.Debug("Session check for key '%s' failed: %s", key, err)
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
	} else {
		t.PixelAPI = pixelapi.New(wc.conf.APIURLInternal, "")
	}

	return t
}
