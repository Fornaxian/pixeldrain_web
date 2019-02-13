package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveRegister(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	var tpld = wc.newTemplateData(w, r)

	// This only runs on the first request
	if wc.captchaSiteKey == "" {
		var api = pixelapi.New(wc.conf.APIURLInternal, "")
		capt, err := api.GetRecaptcha()
		if err != nil {
			log.Error("Error getting recaptcha key: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if capt.SiteKey == "" {
			wc.captchaSiteKey = "none"
		} else {
			wc.captchaSiteKey = capt.SiteKey
		}
	}

	tpld.Other = wc.captchaSiteKey

	err := wc.templates.Get().ExecuteTemplate(w, "register", tpld)
	if err != nil {
		log.Error("Error executing template '%s': %s", "register", err)
	}
}

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
