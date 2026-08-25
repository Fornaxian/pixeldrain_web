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
	var destroyed = true
	if key, err := wc.getAPIKey(r); err == nil {
		var api = wc.api.Login(key)
		if status, err := api.DeleteUserSession(); err != nil {
			log.Warn("logout failed for session '%s': %s", key, err)
		} else {
			// Ending an impersonation does not destroy the session, it returns
			// the admin to their own account
			destroyed = status != "impersonation_ended"
		}
	}

	// Remove the session cookie from the browser. If we leave it here the
	// browser keeps sending the deleted session key, which can shadow the
	// cookie of the next session the user creates.
	//
	// When the session was impersonating another user it is still usable, all
	// that happened is that the admin returned to their own account. Removing
	// the cookie would log them out of their own session too
	if destroyed {
		wc.deleteSessionCookie(w, r)
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
