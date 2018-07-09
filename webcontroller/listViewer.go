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
	if err != nil {
		if (err.(pixelapi.Error)).ReqError {
			log.Error("API request error occurred: %s", (err.(pixelapi.Error)).Value)
		}
		wc.serveNotFound(w, r)
		return
	}

	var ogData OGData
	listdata := map[string]interface{}{
		"id":           list.ID,
		"data":         list.Files,
		"date_created": list.DateCreated,
		"title":        list.Title,
		"views":        0,
	}
	err = wc.templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
		"Title":       fmt.Sprintf("%s ~ Pixeldrain list", list.Title),
		"APIResponse": listdata,
		"Type":        "list",
		"OGData":      ogData.FromList(*list),
	})
	if err != nil {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
