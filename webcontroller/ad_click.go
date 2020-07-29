package webcontroller

import (
	"net/http"
	"time"

	"fornaxian.tech/pixeldrain_server/api/restapi/apiclient"
	"fornaxian.tech/pixeldrain_server/api/util"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveAdClick(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// Redirect the user to the target page
	w.Header().Set("Referrer-Policy", "origin")
	http.Redirect(w, r, r.URL.Query().Get("target"), http.StatusTemporaryRedirect)

	api := apiclient.New(wc.apiURLInternal)

	// The Real IP is used in the API server to determine that the view is not
	// fake
	api.RealIP = util.RemoteAddress(r)

	// Log a view on the file
	if err := api.PostFileView(p.ByName("id"), wc.viewTokenOrBust()); err != nil {
		log.Error("Failed to log view: %s", err)
	}
}

func (wc *WebController) serveCampaignPartner(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	http.SetCookie(w, &http.Cookie{
		Name:    "pd_campaign",
		Value:   p.ByName("id"),
		Path:    "/",
		Expires: time.Now().AddDate(0, 0, 2),
	})

	// Redirect the user to the home page
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}
