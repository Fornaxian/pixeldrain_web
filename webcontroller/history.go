package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/julienschmidt/httprouter"
)

// ServeHistory is the controller for the upload history viewer
func ServeHistory(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	err := templates.Get().ExecuteTemplate(w, "history-cookies", nil)
	if err != nil {
		log.Error("Error executing template history: %s", err)
	}
}
