package webcontroller

import (
	"net/http"
	"time"

	"fornaxian.tech/log"
	"fornaxian.tech/util"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveAdClick(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// Redirect the user to the target page
	w.Header().Set("Referrer-Policy", "origin")
	http.Redirect(w, r, r.URL.Query().Get("target"), http.StatusTemporaryRedirect)

	// The Real IP is used in the API server to determine that the view is not
	// fake
	var api = wc.api.RealIP(util.RemoteAddress(r)).RealAgent(r.UserAgent())

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
		Expires: time.Now().AddDate(0, 0, 7),
	})

	// Redirect the user to the home page
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}
