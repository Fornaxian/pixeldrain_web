package webcontroller

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func viewTokenOrBust(api *pixelapi.PixelAPI) (t string) {
	var err error
	if t, err = api.GetMiscViewToken(); err != nil {
		log.Error("Could not get viewtoken: %s", err)
	}
	return t
}

func browserCompat(ua string) bool {
	return strings.Contains(ua, "MSIE") || strings.Contains(ua, "Trident/7.0")
}

type viewerData struct {
	Type        string // file or list
	CaptchaKey  string
	ViewToken   string
	APIResponse interface{}
}

// ServeFileViewer controller for GET /u/:id
func (wc *WebController) serveFileViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var err error
	if p.ByName("id") == "demo" {
		wc.serveFileViewerDemo(w, r) // Required for a-ads.com quality check
		return
	}

	var ids = strings.Split(p.ByName("id"), ",")

	templateData := wc.newTemplateData(w, r)

	var finfo []pixelapi.ListFile
	for _, id := range ids {
		inf, err := templateData.PixelAPI.GetFileInfo(id)
		if err != nil {
			continue
		}
		finfo = append(finfo, pixelapi.ListFile{FileInfo: inf})
	}

	if len(finfo) == 0 {
		w.WriteHeader(http.StatusNotFound)
		wc.templates.Get().ExecuteTemplate(w, "file_not_found", templateData)
		return
	}

	templateData.OGData = metadataFromFile(finfo[0].FileInfo)
	if len(ids) > 1 {
		templateData.Title = fmt.Sprintf("%d files on pixeldrain", len(finfo))
		templateData.Other = viewerData{
			Type:       "list",
			CaptchaKey: wc.captchaKey(),
			ViewToken:  viewTokenOrBust(templateData.PixelAPI),
			APIResponse: pixelapi.List{
				Success:     true,
				Title:       "Multiple files",
				DateCreated: time.Now(),
				Files:       finfo,
			},
		}
	} else {
		templateData.Title = fmt.Sprintf("%s ~ pixeldrain", finfo[0].Name)
		templateData.Other = viewerData{
			Type:        "file",
			CaptchaKey:  wc.captchaKey(),
			ViewToken:   viewTokenOrBust(templateData.PixelAPI),
			APIResponse: finfo[0].FileInfo,
		}
	}

	var templateName = "file_viewer"
	if browserCompat(r.UserAgent()) {
		templateName = "file_viewer_compat"
	}

	err = wc.templates.Get().ExecuteTemplate(w, templateName, templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
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
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error rendering demo file: %s", err)
	}
}

// ServeListViewer controller for GET /l/:id
func (wc *WebController) serveListViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var templateData = wc.newTemplateData(w, r)
	var list, err = templateData.PixelAPI.GetList(p.ByName("id"))
	if err != nil {
		if err, ok := err.(pixelapi.Error); ok && err.ReqError {
			log.Error("API request error occurred: %s", err.Value)
		}
		w.WriteHeader(http.StatusNotFound)
		wc.templates.Get().ExecuteTemplate(w, "list_not_found", templateData)
		return
	}

	templateData.Title = fmt.Sprintf("%s ~ pixeldrain", list.Title)
	templateData.OGData = metadataFromList(list)
	templateData.Other = viewerData{
		Type:        "list",
		CaptchaKey:  wc.captchaSiteKey,
		ViewToken:   viewTokenOrBust(templateData.PixelAPI),
		APIResponse: list,
	}

	var templateName = "file_viewer"
	if browserCompat(r.UserAgent()) {
		templateName = "file_viewer_compat"
	}

	err = wc.templates.Get().ExecuteTemplate(w, templateName, templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
