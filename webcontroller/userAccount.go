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

	http.Redirect(w, r, "/", http.StatusPermanentRedirect)
}

func (wc *WebController) serveUserHome(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	var key string
	var err error
	if key, err = wc.getAPIKey(r); err != nil {
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	var api = pixelapi.New(wc.conf.APIURLInternal, key)
	files, aerr := api.UserFiles(0, 18)
	if aerr != nil {
		log.Error("Cannot get user files: %v", aerr)
		wc.serveNotFound(w, r)
		return
	}

	templateData := wc.newTemplateData(w, r)
	templateData.Other = files

	err = wc.templates.Get().ExecuteTemplate(w, "user_home", templateData)
	if err != nil {
		log.Error("Failed to execute template: %s", err)
	}
}

func (wc *WebController) serveUserFiles(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	var key string
	var err error
	if key, err = wc.getAPIKey(r); err != nil {
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	var api = pixelapi.New(wc.conf.APIURLInternal, key)
	files, aerr := api.UserFiles(0, 1000)
	if aerr != nil {
		log.Error("Cannot get user files: %v", aerr)
		wc.serveNotFound(w, r)
		return
	}

	templateData := wc.newTemplateData(w, r)
	templateData.Other = files

	err = wc.templates.Get().ExecuteTemplate(w, "file_manager", templateData)
	if err != nil {
		log.Error("Failed to execute template: %s", err)
	}
}
