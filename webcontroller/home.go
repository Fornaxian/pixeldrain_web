package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/webcontroller/templates"

	"github.com/julienschmidt/httprouter"
)

// ServeHome serves the home page
func ServeHome(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	templates.Get().ExecuteTemplate(w, "home", nil)
}
