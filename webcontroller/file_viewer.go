package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

type viewerData struct {
	Type        string // file or list
	CaptchaKey  string
	APIResponse interface{}
}

// ServeFileViewer controller for GET /u/:id
func (wc *WebController) serveFileViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		wc.serveFileViewerDemo(w, r) // Required for a-ads.com quality check
		return
	}

	var list = strings.Contains(p.ByName("id"), ",")
	var ids []string

	if list {
		ids = strings.Split(p.ByName("id"), ",")
	} else {
		ids = append(ids, p.ByName("id"))
	}

	var api = pixelapi.New(wc.conf.APIURLInternal, "")
	var finfo []*pixelapi.FileInfo
	for _, id := range ids {
		inf, err := api.GetFileInfo(id, "")
		if err != nil {
			continue
		}
		finfo = append(finfo, inf)
	}

	if len(finfo) == 0 {
		wc.serveNotFound(w, r)
		return
	}

	templateData := wc.newTemplateData(w, r)
	templateData.OGData = OpenGraphFromFile(*finfo[0])
	var err error
	if list {
		templateData.Title = fmt.Sprintf("%d files in Pixeldrain", len(finfo))
		templateData.Other = viewerData{
			Type:       "list",
			CaptchaKey: wc.captchaKey(),
			APIResponse: map[string]interface{}{
				"data":          finfo,
				"date_created":  "now",
				"title":         "Concatenation of files",
				"date_lastview": "now",
				"views":         0,
			},
		}
	} else {
		templateData.Title = fmt.Sprintf("%s ~ Pixeldrain file", finfo[0].Name)
		templateData.Other = viewerData{
			Type:        "file",
			CaptchaKey:  wc.captchaKey(),
			APIResponse: finfo[0],
		}
	}
	err = wc.templates.Get().ExecuteTemplate(w, "file_viewer", templateData)
	if err != nil {
		log.Error("Error executing template file_viewer: %s", err)
	}
}

// ServeFileViewerDemo is a dummy API response that responds with info about a
// non-existent demo file. This is required by the a-ads ad network to allow for
// automatic checking of the presence of the ad unit on this page.
func (wc *WebController) serveFileViewerDemo(w http.ResponseWriter, r *http.Request) {
	templateData := wc.newTemplateData(w, r)
	templateData.Other = viewerData{
		Type:       "file",
		CaptchaKey: wc.captchaSiteKey,
		APIResponse: map[string]interface{}{
			"id":             "demo",
			"name":           "Demo file",
			"date_upload":    "2017-01-01 12:34:56",
			"date_lastview":  "2017-01-01 12:34:56",
			"size":           123456789,
			"views":          1,
			"bandwidth_used": 123456789,
			"mime_type":      "text/demo",
			"description":    "A file to demonstrate the viewer page",
			"mime_image":     "/res/img/mime/text.png",
			"thumbnail":      "/res/img/mime/text.png",
		},
	}
	err := wc.templates.Get().ExecuteTemplate(w, "file_viewer", templateData)
	if err != nil {
		log.Error("Error rendering demo file: %s", err)
	}
}
