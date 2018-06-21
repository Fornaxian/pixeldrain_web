package webcontroller

import (
	"html/template"
	"net/http"
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

func (wc *WebController) newTemplateData(r *http.Request) *TemplateData {
	var t = &TemplateData{
		Authenticated: false,
		Username:      "Fornax",
		APIEndpoint:   template.URL(wc.conf.APIURLExternal),
	}

	return t
}
