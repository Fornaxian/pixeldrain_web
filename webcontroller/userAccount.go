package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveLogout(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	if key, err := wc.getAPIKey(r); err == nil {
		var api = pixelapi.New(wc.conf.APIURLInternal, key)
		_, err1 := api.UserSessionDestroy(key)
		if err1 != nil {
			log.Warn("logout failed for session '%s': %s", key, err1)
		}
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
