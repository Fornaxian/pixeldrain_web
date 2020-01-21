package webcontroller

import (
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"fornaxian.com/pixeldrain-api/util"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/microcosm-cc/bluemonday"

	"github.com/julienschmidt/httprouter"

	"gopkg.in/russross/blackfriday.v2"
)

// ServeFilePreview controller for GET /u/:id/preview
func (wc *WebController) serveFilePreview(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		serveFilePreviewDemo(w) // Required for a-ads.com quality check
		return
	}
	apikey, _ := wc.getAPIKey(r)
	var api = pixelapi.New(wc.apiURLInternal, apikey)
	api.RealIP = util.RemoteAddress(r)
	inf, err := api.GetFileInfo(p.ByName("id"), "?should_a_view_be_added=yes_gimme") // TODO: Error handling
	if err != nil {
		wc.serveNotFound(w, r)
		return
	}

	var fp = filePreview{
		APIURL:   wc.apiURLExternal,
		PixelAPI: api,
	}
	io.WriteString(w, fp.run(inf))
}

type filePreview struct {
	FileInfo    *pixelapi.FileInfo
	FileURL     string
	DownloadURL string

	APIURL   string
	PixelAPI *pixelapi.PixelAPI
}

func (f filePreview) run(inf *pixelapi.FileInfo) string {
	f.FileInfo = inf
	f.FileURL = f.APIURL + "/file/" + f.FileInfo.ID
	f.DownloadURL = f.APIURL + "/file/" + f.FileInfo.ID + "?download"

	if strings.HasPrefix(f.FileInfo.MimeType, "text") &&
		(strings.HasSuffix(f.FileInfo.Name, ".md") || strings.HasSuffix(f.FileInfo.Name, ".markdown")) {
		return f.markdown()
	}

	// none of the mime type checks triggered, so we return the default page
	return ""
}

func (f filePreview) markdown() string {
	if f.FileInfo.Size > 1e6 { // Prevent out of memory errors
		return "File is too large to view online.\nPlease download and view it locally."
	}

	body, err := f.PixelAPI.GetFile(f.FileInfo.ID)
	if err != nil {
		log.Error("Can't download text file for preview: %s", err)
		return "An error occurred while downloading this file."
	}
	defer body.Close()

	bodyBytes, err := ioutil.ReadAll(body)
	if err != nil {
		log.Error("Can't read text file for preview: %s", err)
		return "An error occurred while reading this file."
	}

	return string(bluemonday.UGCPolicy().SanitizeBytes(blackfriday.Run(bodyBytes)))
}

// ServeFilePreviewDemo serves the content of the demo file. It contains a nice
// message to the human reviewers of the a-ads ad network so they can properly
// categorize the website.
func serveFilePreviewDemo(w http.ResponseWriter) {
	io.WriteString(w,
		`<pre style="line-height: 1em;">
 , __              _
/|/  \o           | |    |              o
 |___/         _  | |  __|   ,_    __,      _  _
 |    |  /\/  |/  |/  /  |  /  |  /  |  |  / |/ |
 |    |_/ /\_/|__/|__/\_/|_/   |_/\_/|_/|_/  |  |_/

This is a demonstration of pixeldrain's file viewer.

The website automatically detects what kind of file you requested and prepares a page for viewing it properly. This is what a text file would look like on pixeldrain. You can upload your own text file at pixeldrain.com/t.

Pixeldrain is a free service for sharing files with large or small groups of people. For more information visit the home page by pressing the home button on the toolbar at the left side of the screen.

Press the Details button or "i" for more info about pixeldrain's file viewer.
</pre>`)
}
