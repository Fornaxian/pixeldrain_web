package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
)

func ServeNotFound(w http.ResponseWriter, r *http.Request) {
	log.Debug("Not Found: %s", r.URL)
	templates.Get().ExecuteTemplate(w, "error", nil)
}
