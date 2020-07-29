package webcontroller

import (
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"fornaxian.tech/pixeldrain_server/api/restapi/apiclient"
	"fornaxian.tech/pixeldrain_server/api/util"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
	"github.com/microcosm-cc/bluemonday"
	blackfriday "github.com/russross/blackfriday/v2"
)

// ServeFilePreview controller for GET /u/:id/preview
func (wc *WebController) serveFilePreview(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		serveFilePreviewDemo(w) // Required for a-ads.com quality check
		return
	}

	api := apiclient.New(wc.apiURLInternal)
	api.APIKey, _ = wc.getAPIKey(r)
	api.RealIP = util.RemoteAddress(r)

	file, err := api.GetFileInfo(p.ByName("id")) // TODO: Error handling
	if err != nil {
		wc.serveNotFound(w, r)
		return
	}

	if strings.HasPrefix(file.MimeType, "text") &&
		(strings.HasSuffix(file.Name, ".md") || strings.HasSuffix(file.Name, ".markdown")) {
		if file.Size > 1e6 { // Prevent out of memory errors
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

		bodyBytes, err := ioutil.ReadAll(body)
		if err != nil {
			log.Error("Can't read text file for preview: %s", err)
			w.Write([]byte("An error occurred while reading this file."))
			return
		}

		w.Write(bluemonday.UGCPolicy().SanitizeBytes(blackfriday.Run(bodyBytes)))
	}
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
