package webcontroller

import (
	"fmt"
	"net/http"

	"fornaxian.com/pixeldrain-web/pixelapi"

	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// ServeListViewer controller for GET /l/:id
func (wc *WebController) serveListViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var api = pixelapi.New(wc.conf.APIURLInternal, "")
	var list, err = api.GetList(p.ByName("id"))
	var templateData = wc.newTemplateData(w, r)
	if err != nil {
		if err, ok := err.(pixelapi.Error); ok && err.ReqError {
			log.Error("API request error occurred: %s", err.Value)

		}
		w.WriteHeader(http.StatusNotFound)
		wc.templates.Get().ExecuteTemplate(w, "list_not_found", templateData)
		return
	}

	templateData.Title = fmt.Sprintf("%s ~ Pixeldrain list", list.Title)
	templateData.OGData = metadataFromList(*list)
	templateData.Other = viewerData{
		Type:       "list",
		CaptchaKey: wc.captchaSiteKey,
		APIResponse: map[string]interface{}{
			"id":           list.ID,
			"data":         list.Files,
			"date_created": list.DateCreated,
			"title":        list.Title,
			"views":        0,
		},
	}
	err = wc.templates.Get().ExecuteTemplate(w, "file_viewer", templateData)
	if err != nil {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
