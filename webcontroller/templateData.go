package webcontroller

import (
	"net/http"
)

// TemplateData is a struct that every template expects when being rendered. In
// the field Other you can pass your own template-specific variables.
type TemplateData struct {
	Authenticated bool
	Username      string

	Recaptcha struct {
		Enabled bool
		PubKey  string
	}

	Other interface{}
}

func (wc *WebController) newTemplateData(r http.Request) *TemplateData {
	var t = &TemplateData{}

	return t
}
