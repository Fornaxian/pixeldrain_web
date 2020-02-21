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

	// Get the view token without authentication
	vt := viewTokenOrBust(api)

	// Apply authentication and register the view
	api.APIKey, _ = wc.getAPIKey(r)
	api.RealIP = util.RemoteAddress(r)

	// Log a view on the file
	if err := api.PostFileView(p.ByName("id"), vt); err != nil {
		log.Warn("Failed to log view")
	}
}
