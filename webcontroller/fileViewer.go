package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/julienschmidt/httprouter"
)

// ServeFileViewer controller for GET /u/:id
func ServeFileViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		ServeFileViewerDemo(w) // Required for a-ads.com quality check
		return
	}

	var list = strings.Contains(p.ByName("id"), ",")
	var ids []string

	if list {
		ids = strings.Split(p.ByName("id"), ",")
	} else {
		ids = append(ids, p.ByName("id"))
	}

	var finfo []*pixelapi.FileInfo
	for _, id := range ids {
		inf := pixelapi.GetFileInfo(id)
		if inf == nil {
			continue
		}
		finfo = append(finfo, inf)
	}

	if len(finfo) == 0 {
		ServeNotFound(w, r)
		return
	}

	var err error
	if list {
		listdata := map[string]interface{}{
			"data":          finfo,
			"date_created":  "now",
			"title":         "Concatenation of files",
			"date_lastview": "now",
			"views":         0,
		}
		err = templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
			"Title":       fmt.Sprintf("%d files in Pixeldrain", len(finfo)),
			"APIResponse": listdata,
			"Type":        "list",
		})
	} else {
		err = templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
			"Title":       fmt.Sprintf("%s ~ Pixeldrain file", finfo[0].FileName),
			"APIResponse": finfo[0],
			"Type":        "file",
		})
	}
	if err != nil {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
