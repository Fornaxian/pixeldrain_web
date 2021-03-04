package webcontroller

import (
	"fmt"
	"io/ioutil"
	"math/rand"
	"mime"
	"net/http"
	"strconv"
	"strings"
	"time"

	"fornaxian.tech/pixeldrain_server/api/restapi/apiclient"
	"fornaxian.tech/pixeldrain_server/api/restapi/apitype"
	"github.com/Fornaxian/log"
	pdmimetype "github.com/Fornaxian/pd_mime_type"
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

func adType() int {
	const (
		aAds               = 0
		amarulaElectronics = 1
		patreon            = 2
		soulStudio         = 3
		amarulaSolutions   = 4
		adMaven            = 5
		propellerAds       = 7
		pdpro1             = 8
		pdpro2             = 9
		pdpro3             = 10
		pdpro4             = 11
	)

	// Intn returns a number up to n, but never n itself. So to get a random 0
	// or 1 we need to give it n=2. We can use this function to make other
	// splits like 1/3 1/4, etc
	switch i := rand.Intn(20); i {
	case 0, 1: // 10%
		return amarulaSolutions
	case 2: // 5%, also shows propellerads
		return pdpro1
	case 3: // 5%, also shows propellerads
		return pdpro2
	case 4: // 5%, also shows propellerads
		return pdpro3
	case 5: // 5%, also shows propellerads
		return pdpro4
	default: // 70%, also shows a-ads
		return propellerAds
		// default:
		// 	panic(fmt.Errorf("random number generator returned unrecognised number: %d", i))
	}
}

type viewerData struct {
	Type           string // file or list
	CaptchaKey     string
	ViewToken      string
	AdType         int
	FileAdsEnabled bool
	UserAdsEnabled bool
	APIResponse    interface{}
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

	var files []apitype.ListFile
	for _, id := range ids {
		inf, err := templateData.PixelAPI.GetFileInfo(id)
		if err != nil {
			if apiclient.ErrIsServerError(err) {
				wc.templates.Get().ExecuteTemplate(w, "500", templateData)
				return
			}
			continue
		}
		files = append(files, apitype.ListFile{FileInfo: inf})
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
		AdType:         adType(),
		FileAdsEnabled: files[0].ShowAds,
		UserAdsEnabled: !(templateData.Authenticated && templateData.User.Subscription.DisableAdDisplay),
	}
	if len(ids) > 1 {
		templateData.Title = fmt.Sprintf("%d files on pixeldrain", len(files))
		vd.Type = "list"
		vd.APIResponse = apitype.ListInfo{
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
		AdType:         0, // Always show a-ads on the demo page
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
	var list, err = templateData.PixelAPI.GetList(p.ByName("id"))
	if err != nil {
		if err, ok := err.(apiclient.Error); ok && err.Status == http.StatusNotFound {
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
	templateData.Other = viewerData{
		Type:           "list",
		CaptchaKey:     wc.captchaSiteKey,
		ViewToken:      wc.viewTokenOrBust(),
		AdType:         adType(),
		FileAdsEnabled: list.Files[0].ShowAds,
		UserAdsEnabled: !(templateData.Authenticated && templateData.User.Subscription.DisableAdDisplay),
		APIResponse:    list,
	}

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

// ServeFileViewer controller for GET /s/:id
func (wc *WebController) serveSkynetViewer(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var err error
	templateData := wc.newTemplateData(w, r)

	// Get the first few bytes from the file to probe the content type and
	// length
	rq, err := http.NewRequest("GET", "https://siasky.net/file/"+p.ByName("id"), nil)
	if err != nil {
		log.Warn("Failed to make request to sia portal: %s", err)
		w.WriteHeader(http.StatusInternalServerError)
		wc.templates.Get().ExecuteTemplate(w, "500", templateData)
		return
	}

	// Range header limits the number of bytes which will be read
	rq.Header.Set("Range", "bytes=0-1023")

	resp, err := wc.httpClient.Do(rq)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 500 {
		head, _ := ioutil.ReadAll(resp.Body)
		log.Warn("Sia portal returned error: %s", head)
		w.WriteHeader(http.StatusInternalServerError)
		wc.templates.Get().ExecuteTemplate(w, "500", templateData)
		return
	} else if resp.StatusCode >= 400 {
		w.WriteHeader(http.StatusNotFound)
		wc.templates.Get().ExecuteTemplate(w, "file_not_found", templateData)
		return
	}

	head, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Warn("Failed to read file header from Sia portal: %s", err)
		w.WriteHeader(http.StatusInternalServerError)
		wc.templates.Get().ExecuteTemplate(w, "500", templateData)
		return
	}

	var fileType = resp.Header.Get("Content-Type")
	if fileType == "application/octet-stream" || fileType == "" {
		fileType = pdmimetype.Detect(head)
	}

	// Now get the size of the file from the content-range header
	contentRange := resp.Header.Get("Content-Range")
	if contentRange == "" {
		log.Warn("Sia portal didn't send Content-Range")
		w.WriteHeader(http.StatusInternalServerError)
		wc.templates.Get().ExecuteTemplate(w, "500", templateData)
		return
	}
	contentRange = strings.TrimPrefix(contentRange, "bytes ")
	size, err := strconv.ParseInt(strings.Split(contentRange, "/")[1], 10, 64)
	if err != nil {
		panic(err)
	}

	var name string
	_, params, err := mime.ParseMediaType(resp.Header.Get("Content-Disposition"))
	if err != nil {
		name = "skynet_file"
	} else {
		name = params["filename"]
	}

	templateData.Title = fmt.Sprintf("name ~ Skynet")
	templateData.Other = viewerData{
		Type:   "skylink",
		AdType: adType(),
		APIResponse: apitype.FileInfo{
			Success:      true,
			ID:           p.ByName("id"),
			Name:         name,
			Size:         size,
			DateUpload:   time.Now(),
			DateLastView: time.Now(),
			MimeType:     fileType,
		},
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
