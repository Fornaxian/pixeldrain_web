package webcontroller

import (
	"fmt"
	"html/template"
	"net/http"
	"strings"
	"time"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) viewTokenOrBust() (t string) {
	var err error
	if t, err = wc.api.GetMiscViewToken(); err != nil && !wc.config.ProxyAPIRequests {
		log.Error("Could not get viewtoken: %s", err)
	}
	return t
}

func browserCompat(ua string) bool {
	return strings.Contains(ua, "MSIE") || strings.Contains(ua, "Trident/7.0")
}

type fileViewerData struct {
	Type           string       `json:"type"` // file or list
	APIResponse    interface{}  `json:"api_response"`
	CaptchaKey     string       `json:"captcha_key"`
	ViewToken      string       `json:"view_token"`
	Embedded       bool         `json:"embedded"`
	UserAdsEnabled bool         `json:"user_ads_enabled"`
	ThemeURI       template.URL `json:"theme_uri"`
}

func (vd *fileViewerData) themeOverride(r *http.Request, files []pixelapi.ListFile) {
	vd.ThemeURI = "/theme.css"
	var theme = r.URL.Query().Get("style")
	var hue = r.URL.Query().Get("hue")

	if files[0].Branding != nil {
		if theme == "" {
			theme = files[0].Branding["theme"]
		}
		if hue == "" {
			hue = files[0].Branding["hue"]
		}
	}

	if theme != "" {
		vd.ThemeURI += template.URL("?style=" + theme)
		if hue != "" {
			vd.ThemeURI += template.URL("&hue=" + hue)
		}
	}
}

// ServeFileViewer controller for GET /u/:id
func (wc *WebController) serveFileViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		wc.serveViewerDemo(w, r) // Required for a-ads.com quality check
		return
	}

	// If the user agent is Wget we redirect it to the API so that the file can
	// be downloaded directly
	if strings.HasPrefix(r.UserAgent(), "Wget/") {
		http.Redirect(w, r, "/api/file/"+p.ByName("id"), http.StatusSeeOther)
		return
	}

	var err error
	var ids = strings.Split(p.ByName("id"), ",")
	var templateData = wc.newTemplateData(w, r)

	var files []pixelapi.ListFile
	for _, id := range ids {
		inf, err := templateData.PixelAPI.GetFileInfo(id)
		if err != nil {
			if pixelapi.ErrIsServerError(err) {
				wc.templates.Get().ExecuteTemplate(w, "500", templateData)
				return
			}
			continue
		}
		files = append(files, pixelapi.ListFile{FileInfo: inf})
	}

	if len(files) == 0 {
		w.WriteHeader(http.StatusNotFound)
		wc.templates.Get().ExecuteTemplate(w, "file_not_found", templateData)
		return
	}

	if files[0].SkipFileViewer {
		http.Redirect(w, r, "/api/file/"+p.ByName("id"), http.StatusSeeOther)
		return
	}

	templateData.OGData = wc.metadataFromFile(files[0].FileInfo)

	var vd = fileViewerData{
		CaptchaKey:     wc.captchaKey(),
		ViewToken:      wc.viewTokenOrBust(),
		UserAdsEnabled: templateData.User.Subscription.ID == "",
	}

	if len(ids) > 1 {
		templateData.Title = fmt.Sprintf("%d files on pixeldrain", len(files))
		vd.Type = "list"
		vd.APIResponse = pixelapi.ListInfo{
			Title:       "Multiple files",
			DateCreated: time.Now(),
			Files:       files,
		}
	} else {
		templateData.Title = fmt.Sprintf("%s ~ pixeldrain", files[0].Name)
		vd.Type = "file"
		vd.APIResponse = files[0].FileInfo
	}

	if _, ok := r.URL.Query()["embed"]; ok {
		vd.Embedded = true
	}

	vd.themeOverride(r, files)
	templateData.Other = vd

	for _, file := range files {
		if file.AbuseType != "" {
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			break
		}
	}

	var templateName = "file_viewer_svelte"
	if browserCompat(r.UserAgent()) {
		templateName = "file_viewer_compat"
	}

	err = wc.templates.Get().ExecuteTemplate(w, templateName, templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error executing template file_viewer: %s", err)
	}
}

func (wc *WebController) serveListViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	// If the user agent is Wget we redirect it to the API so that the file can
	// be downloaded directly
	if strings.HasPrefix(r.UserAgent(), "Wget/") {
		http.Redirect(w, r, "/api/list/"+p.ByName("id")+"/zip", http.StatusSeeOther)
		return
	}

	var templateData = wc.newTemplateData(w, r)
	var list, err = templateData.PixelAPI.GetListID(p.ByName("id"))
	if err != nil {
		if err, ok := err.(pixelapi.Error); ok && err.Status == http.StatusNotFound {
			w.WriteHeader(http.StatusNotFound)
			wc.templates.Get().ExecuteTemplate(w, "list_not_found", templateData)
		} else {
			log.Error("API request error occurred: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			wc.templates.Get().ExecuteTemplate(w, "500", templateData)
		}
		return
	}
	if len(list.Files) == 0 {
		w.WriteHeader(http.StatusNotFound)
		wc.templates.Get().ExecuteTemplate(w, "list_not_found", templateData)
		return
	}

	templateData.Title = fmt.Sprintf("%s ~ pixeldrain", list.Title)
	templateData.OGData = wc.metadataFromList(list)
	var vd = fileViewerData{
		Type:           "list",
		CaptchaKey:     wc.captchaSiteKey,
		ViewToken:      wc.viewTokenOrBust(),
		UserAdsEnabled: templateData.User.Subscription.ID == "",
		APIResponse:    list,
	}

	if _, ok := r.URL.Query()["embed"]; ok {
		vd.Embedded = true
	}

	vd.themeOverride(r, list.Files)
	templateData.Other = vd

	for _, file := range list.Files {
		if file.AbuseType != "" {
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			break
		}
	}

	var templateName = "file_viewer_svelte"
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
func (wc *WebController) serveViewerDemo(w http.ResponseWriter, r *http.Request) {
	templateData := wc.newTemplateData(w, r)
	templateData.Other = fileViewerData{
		Type:           "file",
		CaptchaKey:     wc.captchaSiteKey,
		UserAdsEnabled: true,
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
			"abuse_type":     "",
			"show_ads":       true,
		},
	}
	err := wc.templates.Get().ExecuteTemplate(w, "file_viewer_svelte", templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error rendering demo file: %s", err)
	}
}
