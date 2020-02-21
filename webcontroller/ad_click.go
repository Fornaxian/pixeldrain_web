package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-api/util"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveAdClick(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// Redirect the user to the target page
	http.Redirect(w, r, r.URL.Query().Get("target"), http.StatusTemporaryRedirect)

	// Get a view token
	td := wc.newTemplateData(w, r)
	td.PixelAPI.RealIP = util.RemoteAddress(r)
	vt := viewTokenOrBust(td.PixelAPI)

	// Log a view on the file
	if err := td.PixelAPI.PostFileView(p.ByName("id"), vt); err != nil {
		log.Warn("Failed to log view")
	}
}
