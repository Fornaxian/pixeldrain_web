package webcontroller

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

type fileViewerData struct {
	Type             string      `json:"type"` // file or list
	APIResponse      interface{} `json:"api_response"`
	CaptchaKey       string      `json:"captcha_key"`
	ViewToken        string      `json:"view_token"`
	AdBannerType     string      `json:"ad_banner_type"`
	AdSkyscraperType string      `json:"ad_skyscraper_type"`
	AdFloaterType    string      `json:"ad_floater_type"`
	Embedded         bool        `json:"embedded"`
	FileAdsEnabled   bool        `json:"file_ads_enabled"`
	UserAdsEnabled   bool        `json:"user_ads_enabled"`
}

// ServeFileViewer controller for GET /u/:id
func (wc *WebController) serveSvelteFile(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
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

	templateData.OGData = wc.metadataFromFile(files[0].FileInfo)

	var vd = fileViewerData{
		CaptchaKey:     wc.captchaKey(),
		ViewToken:      wc.viewTokenOrBust(),
		FileAdsEnabled: files[0].ShowAds,
		UserAdsEnabled: !(templateData.Authenticated && templateData.User.Subscription.DisableAdDisplay),
	}

	if len(ids) > 1 {
		templateData.Title = fmt.Sprintf("%d files on pixeldrain", len(files))
		vd.Type = "list"
		vd.APIResponse = pixelapi.ListInfo{
			Success:     true,
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

	templateData.Other = vd

	for _, file := range files {
		if file.AbuseType != "" {
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			break
		}
	}

	err = wc.templates.Get().ExecuteTemplate(w, "file_viewer_svelte", templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error executing template file_viewer: %s", err)
	}
}

func (wc *WebController) serveSvelteList(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
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
		FileAdsEnabled: list.Files[0].ShowAds,
		UserAdsEnabled: !(templateData.Authenticated && templateData.User.Subscription.DisableAdDisplay),
		APIResponse:    list,
	}

	if _, ok := r.URL.Query()["embed"]; ok {
		vd.Embedded = true
	}
	templateData.Other = vd

	for _, file := range list.Files {
		if file.AbuseType != "" {
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			break
		}
	}

	err = wc.templates.Get().ExecuteTemplate(w, "file_viewer_svelte", templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
