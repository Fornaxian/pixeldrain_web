package webcontroller

import (
	"fmt"
	"html/template"
	"io"
	"net/http"
	"strings"
	"time"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"fornaxian.tech/util"
	"github.com/julienschmidt/httprouter"
	"github.com/microcosm-cc/bluemonday"
	blackfriday "github.com/russross/blackfriday/v2"
)

func browserCompat(ua string) bool {
	return strings.Contains(ua, "MSIE") || strings.Contains(ua, "Trident/7.0")
}

type fileViewerData struct {
	Type           string       `json:"type"` // file or list
	APIResponse    interface{}  `json:"api_response"`
	CaptchaKey     string       `json:"captcha_key"`
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
	// If the user agent is Wget we redirect it to the API so that the file can
	// be downloaded directly
	if strings.HasPrefix(r.UserAgent(), "Wget/") {
		http.Redirect(w, r, "/api/file/"+p.ByName("id"), http.StatusSeeOther)
		return
	}

	// Prevent search engines from indexing this page for privacy reasons
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")

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
	if err != nil && !util.IsNetError(err) {
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

	// Prevent search engines from indexing this page for privacy reasons
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")

	var templateData = wc.newTemplateData(w, r)
	var list, err = templateData.PixelAPI.GetListID(p.ByName("id"))
	if err != nil {
		if apiErr, ok := err.(pixelapi.Error); ok && apiErr.Status == http.StatusNotFound {
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
	if err != nil && !util.IsNetError(err) {
		log.Error("Error executing template file_viewer: %s", err)
	}
}

func (wc *WebController) serveFilePreview(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	apiKey, _ := wc.getAPIKey(r)
	api := wc.api.Login(apiKey).RealIP(util.RemoteAddress(r)).RealAgent(r.UserAgent())

	file, err := api.GetFileInfo(p.ByName("id")) // TODO: Error handling
	if err != nil {
		wc.serveNotFound(w, r)
		return
	}

	if strings.HasPrefix(file.MimeType, "text") &&
		(strings.HasSuffix(file.Name, ".md") || strings.HasSuffix(file.Name, ".markdown")) {
		if file.Size > 1<<22 { // Prevent out of memory errors
			w.Write([]byte("File is too large to view online.\nPlease download and view it locally."))
			return
		}

		body, err := api.GetFile(file.ID)
		if err != nil {
			log.Error("Can't download text file for preview: %s", err)
			w.Write([]byte("An error occurred while downloading this file."))
			return
		}
		defer body.Close()

		bodyBytes, err := io.ReadAll(body)
		if err != nil {
			log.Error("Can't read text file for preview: %s", err)
			w.Write([]byte("An error occurred while reading this file."))
			return
		}

		w.Write(bluemonday.UGCPolicy().SanitizeBytes(blackfriday.Run(bodyBytes)))
	}
}
