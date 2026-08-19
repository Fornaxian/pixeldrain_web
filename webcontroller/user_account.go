package webcontroller

import (
	"net/http"

	"fornaxian.tech/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveLogout(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	if key, err := wc.getAPIKey(r); err == nil {
		var api = wc.api.Login(key)
		if err = api.DeleteUserSession(key); err != nil {
			log.Warn("logout failed for session '%s': %s", key, err)
		}
	}

	// Remove the session cookie from the browser. If we leave it here the
	// browser keeps sending the deleted session key, which can shadow the
	// cookie of the next session the user creates
	wc.deleteSessionCookie(w, r)

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
