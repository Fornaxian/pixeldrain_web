package webcontroller

import (
	"fmt"
	"net/http"

	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/julienschmidt/httprouter"
)

// ServeListViewer controller for GET /l/:id
func ServeListViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var list = pixelapi.GetList(p.ByName("id"))
	if list.Error != nil {
		if list.Error.ReqError {
			log.Error("API request error occurred: %s", list.Error.Value)
		}
		ServeNotFound(w, r)
		return
	}

	var err error
	var ogData OGData
	listdata := map[string]interface{}{
		"id":           list.ID,
		"data":         list.Files,
		"date_created": list.DateCreated,
		"title":        list.Title,
		"views":        0,
	}
	err = templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
		"Title":       fmt.Sprintf("%s ~ Pixeldrain list", list.Title),
		"APIResponse": listdata,
		"Type":        "list",
		"OGData":      ogData.FromList(*list),
	})
	if err != nil {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
