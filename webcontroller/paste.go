package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/webcontroller/templates"

	"github.com/julienschmidt/httprouter"
)

// ServePaste serves the page that is used to upload plain text files
func ServePaste(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	templates.Get().ExecuteTemplate(w, "paste", nil)
}
