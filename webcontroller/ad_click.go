package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-api/util"

	"fornaxian.com/pixeldrain-web/pixelapi"

	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveAdClick(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// Redirect the user to the target page
	http.Redirect(w, r, r.URL.Query().Get("target"), http.StatusTemporaryRedirect)

	api := pixelapi.New(wc.apiURLInternal)

	// The Real IP is used in the API server to determine that the view is not
	// fake
	api.RealIP = util.RemoteAddress(r)

	// Log a view on the file
	if err := api.PostFileView(p.ByName("id"), wc.viewTokenOrBust()); err != nil {
		log.Warn("Failed to log view")
	}
}
