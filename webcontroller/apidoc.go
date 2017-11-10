package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"

	"github.com/julienschmidt/httprouter"
)

// ServeAPIDoc serves the API docuementation
func ServeAPIDoc(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	err := templates.Get().ExecuteTemplate(w, "apidoc", nil)
	if err != nil {
		log.Error("Error executing template apidoc: %s", err)
	}
}
