package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// ServeFileViewer controller for GET /u/:id
func (wc *WebController) serveFileViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		wc.serveFileViewerDemo(w) // Required for a-ads.com quality check
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
		inf, err := wc.api.GetFileInfo(id)
		if err != nil {
			continue
		}
		finfo = append(finfo, inf)
	}

	if len(finfo) == 0 {
		wc.serveNotFound(w, r)
		return
	}

	var ogData OGData
	var err error
	if list {
		listdata := map[string]interface{}{
			"data":          finfo,
			"date_created":  "now",
			"title":         "Concatenation of files",
			"date_lastview": "now",
			"views":         0,
		}
		err = wc.templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
			"Title":       fmt.Sprintf("%d files in Pixeldrain", len(finfo)),
			"APIResponse": listdata,
			"Type":        "list",
			"OGData":      ogData.FromFile(*finfo[0]),
		})
	} else {
		err = wc.templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
			"Title":       fmt.Sprintf("%s ~ Pixeldrain file", finfo[0].FileName),
			"APIResponse": finfo[0],
			"Type":        "file",
			"OGData":      ogData.FromFile(*finfo[0]),
		})
	}
	if err != nil {
		log.Error("Error executing template file_viewer: %s", err)
	}
}

// ServeFileViewerDemo is a dummy API response that responds with info about a
// non-existent demo file. This is required by the a-ads ad network to allow for
// automatic checking of the presence of the ad unit on this page.
func (wc *WebController) serveFileViewerDemo(w http.ResponseWriter) {
	wc.templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
		"APIResponse": map[string]interface{}{
			"id":            "demo",
			"file_name":     "Demo file",
			"date_upload":   "2017-01-01 12:34:56",
			"date_lastview": "2017-01-01 12:34:56",
			"file_size":     123456789,
			"views":         1,
			"mime_type":     "text/demo",
			"description":   "A file to demonstrate the viewer page",
			"mime_image":    "/res/img/mime/text.png",
			"thumbnail":     "/res/img/mime/text.png",
		},
		"Type": "file",
	})
}
