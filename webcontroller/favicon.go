package webcontroller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"

	"fornaxian.com/pixeldrain-web/conf"
)

// ServeFavicon yes we need a controller for this
func ServeFavicon(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	http.ServeFile(w, r, conf.StaticResourceDir()+"favicon.ico")
}
