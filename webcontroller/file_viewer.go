package webcontroller

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) viewTokenOrBust() (t string) {
	var err error
	if t, err = wc.api.GetMiscViewToken(); err != nil && !wc.proxyAPIRequests {
		log.Error("Could not get viewtoken: %s", err)
	}
	return t
}

func browserCompat(ua string) bool {
	return strings.Contains(ua, "MSIE") || strings.Contains(ua, "Trident/7.0")
}

type viewerData struct {
	Type           string // file or list
	CaptchaKey     string
	ViewToken      string
	AdBannerType   int
	AdFloaterType  int
	AdPopupType    int
	FileAdsEnabled bool
	UserAdsEnabled bool
	Embedded       bool
	APIResponse    interface{}
}

func (vd *viewerData) adType(files []pixelapi.ListFile) {
	if len(files) == 0 {
		return
	}

	var avgSize int64
	for _, v := range files {
		avgSize += v.Size
	}
	avgSize /= int64(len(files))

	const (
		// Banners
		none               = 0
		aAds               = 1
		patreon            = 2
		soulStudio         = 3
		amarulaSolutions   = 4
		adMaven            = 5
		adSterra           = 6
		brave              = 7
		pdpro1             = 8
		pdpro2             = 9
		pdpro3             = 10
		pdpro4             = 11
		clickAduBanner     = 12
		amarulaElectronics = 13

		// Floaters
		propellerFloat = 1
		adSterraFloat  = 2
		adMavenFloat   = 3

		// Popunders
		clickAduPopup  = 1
		propellerPopup = 2
	)

	// Intn returns a number up to n, but never n itself. So to get a random 0
	// or 1 we need to give it n=2. We can use this function to make other
	// splits like 1/3 1/4, etc
	switch i := rand.Intn(4); i {
	case 0: // 25%
		vd.AdBannerType = brave
	case 2, 3, 4: // 75%
		vd.AdBannerType = aAds
	default:
		panic(fmt.Errorf("random number generator returned unrecognised number: %d", i))
	}

	// If the file is larger than 5 MB we enable floating popups
	if avgSize > 5e6 {
		vd.AdFloaterType = propellerFloat
	}
}

// ServeFileViewer controller for GET /u/:id
func (wc *WebController) serveFileViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var err error
	if p.ByName("id") == "demo" {
		wc.serveFileViewerDemo(w, r) // Required for a-ads.com quality check
		return
	}

	// If the user agent is Wget we redirect it to the API so that the file can
	// be downloaded directly
	if strings.HasPrefix(r.UserAgent(), "Wget/") {
		http.Redirect(w, r, "/api/file/"+p.ByName("id"), http.StatusSeeOther)
		return
	}

	var ids = strings.Split(p.ByName("id"), ",")

	templateData := wc.newTemplateData(w, r)

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

	var vd = viewerData{
		CaptchaKey:     wc.captchaKey(),
		ViewToken:      wc.viewTokenOrBust(),
		FileAdsEnabled: files[0].ShowAds,
		UserAdsEnabled: !(templateData.Authenticated && templateData.User.Subscription.DisableAdDisplay),
	}
	vd.adType(files)

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

	var templateName = "file_viewer"
	if browserCompat(r.UserAgent()) {
		templateName = "file_viewer_compat"
	}

	for _, file := range files {
		if file.AbuseType != "" {
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			break
		}
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
		Type:           "file",
		CaptchaKey:     wc.captchaSiteKey,
		AdBannerType:   1, // Always show a-ads on the demo page
		FileAdsEnabled: true,
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
	var vd = viewerData{
		Type:           "list",
		CaptchaKey:     wc.captchaSiteKey,
		ViewToken:      wc.viewTokenOrBust(),
		FileAdsEnabled: list.Files[0].ShowAds,
		UserAdsEnabled: !(templateData.Authenticated && templateData.User.Subscription.DisableAdDisplay),
		APIResponse:    list,
	}
	vd.adType(list.Files)

	if _, ok := r.URL.Query()["embed"]; ok {
		vd.Embedded = true
	}
	templateData.Other = vd

	var templateName = "file_viewer"
	if browserCompat(r.UserAgent()) {
		templateName = "file_viewer_compat"
	}

	for _, file := range list.Files {
		if file.AbuseType != "" {
			w.WriteHeader(http.StatusUnavailableForLegalReasons)
			break
		}
	}

	err = wc.templates.Get().ExecuteTemplate(w, templateName, templateData)
	if err != nil && !strings.Contains(err.Error(), "broken pipe") {
		log.Error("Error executing template file_viewer: %s", err)
	}
}
