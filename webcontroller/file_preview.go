package webcontroller

import (
	"fmt"
	"html"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"path/filepath"
	"strings"

	"fornaxian.com/pixeldrain-api/util"
	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/microcosm-cc/bluemonday"

	"github.com/julienschmidt/httprouter"
	"github.com/timakin/gonvert"

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

	if strings.HasPrefix(f.FileInfo.MimeType, "image") {
		return f.image()
	} else if strings.HasPrefix(f.FileInfo.MimeType, "video") {
		return f.video()
	} else if strings.HasPrefix(f.FileInfo.MimeType, "audio") {
		return f.audio()
	} else if strings.HasPrefix(f.FileInfo.MimeType, "text") {
		if strings.HasSuffix(f.FileInfo.Name, ".md") || strings.HasSuffix(f.FileInfo.Name, ".markdown") {
			return f.markdown()
		}
		return f.text()
	}

	switch f.FileInfo.MimeType {
	case
		"application/ogg":
		return f.audio()
	case
		"application/matroska",
		"application/x-matroska":
		return f.video()
	case
		"application/pdf",
		"application/x-pdf":
		return f.pdf()
	case
		"application/octet-stream": // Fallback for when mime type not recognized
		switch filepath.Ext(f.FileInfo.Name) {
		case
			".mp3":
			return f.audio()
		case
			".mp4":
			return f.video()
		}
	}

	// none of the mime type checks triggered, so we return the default page
	return f.def()
}

func (f filePreview) image() string {
	return fmt.Sprintf(`<div class="image-container">
<img id="displayImg" src="%s" class="pannable drop-shadow"/>
</div>
<script src="/res/viewer-scripts/image.js"></script>`,
		f.FileURL)
}

func (f filePreview) audio() string {
	return fmt.Sprintf(`<div class="image-container">
<br/>
<img src="/res/img/mime/audio.png" alt="Audio"/>
<br/>%s<br/>
<audio id="audioPlayer" controls="controls" autoplay="autoplay" style="width:90%%;">
<source src="%s" />
</audio>
</div>
<script src="/res/viewer-scripts/audio.js"></script>`,
		f.FileInfo.Name,
		f.FileURL,
	)
}

func (f filePreview) video() string {
	return fmt.Sprintf(`<div class="image-container">
<video id="videoPlayer" autoplay="autoplay" controls="controls" class="center drop-shadow">
<source src="%s"/>
Your web browser does not support the HTML video tag.
</video>
</div>
<script src="/res/viewer-scripts/video.js"></script>`,
		f.FileURL,
	)

}

func (f filePreview) pdf() string {
	u, _ := url.Parse(f.FileURL)
	return f.frame("/res/misc/pdf-viewer/web/viewer.html?file=" + u.String())
}

func (f filePreview) text() string {
	htmlOut := `<div class="text-container">
<pre class="pre-container %s" style="width: 100%%;">%s</pre>
</div>`

	if f.FileInfo.Size > 1<<22 { // 4 MiB limit to prevent out of memory errors
		return fmt.Sprintf(htmlOut, "",
			"File is too large to view online.\nPlease download and view it locally.",
		)
	}

	body, err := f.PixelAPI.GetFile(f.FileInfo.ID)
	if err != nil {
		log.Error("Can't download text file for preview: %s", err)
		return fmt.Sprintf(htmlOut, "",
			"An error occurred while downloading this file.",
		)
	}
	defer body.Close()

	bodyBytes, err := ioutil.ReadAll(body)
	if err != nil {
		log.Error("Can't read text file for preview: %s", err)
		return fmt.Sprintf(htmlOut, "",
			"An error occurred while reading this file.",
		)
	}

	converter := gonvert.New(string(bodyBytes), gonvert.UTF8)
	result, err := converter.Convert()
	if err != nil {
		log.Debug("Unable to decode text file: %s", err)
		return fmt.Sprintf(htmlOut, "",
			"This file is using an unknown character encoding.\nPlease download it and view it locally.",
		)
	}

	htmlOut += `<script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert"></script>`

	return fmt.Sprintf(htmlOut, "prettyprint linenums", html.EscapeString(result))
}

func (f filePreview) markdown() string {
	htmlOut := `<div class="text-container">%s</div>`

	if f.FileInfo.Size > 1e6 { // Prevent out of memory errors
		return fmt.Sprintf(htmlOut, "",
			"File is too large to view online.\nPlease download and view it locally.",
		)
	}

	body, err := f.PixelAPI.GetFile(f.FileInfo.ID)
	if err != nil {
		log.Error("Can't download text file for preview: %s", err)
		return fmt.Sprintf(htmlOut, "",
			"An error occurred while downloading this file.",
		)
	}
	defer body.Close()

	bodyBytes, err := ioutil.ReadAll(body)
	if err != nil {
		log.Error("Can't read text file for preview: %s", err)
		return fmt.Sprintf(htmlOut, "",
			"An error occurred while reading this file.",
		)
	}

	md := bluemonday.UGCPolicy().SanitizeBytes(blackfriday.Run(bodyBytes))

	return fmt.Sprintf(htmlOut, md)
}

func (f filePreview) frame(url string) string {
	return fmt.Sprintf(`<iframe src="%s" class="image-container"
seamless="seamless" frameborder="0" allowtransparency="true"
</iframe>`,
		url,
	)
}

func (f filePreview) def() string {
	return fmt.Sprintf(
		`<br/><img src="%s" class="image"><br/>%s<br/>Type: '%s'`,
		f.APIURL+f.FileInfo.ThumbnailHREF,
		f.FileInfo.Name,
		f.FileInfo.MimeType,
	)
}

// ServeFilePreviewDemo serves the content of the demo file. It contains a nice
// message to the human reviewers of the a-ads ad network so they can properly
// categorize the website.
func serveFilePreviewDemo(w http.ResponseWriter) {
	io.WriteString(w,
		`<script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert"></script>
<div class="text-container"><pre class="pre-container linenums" style="width: 100%">
 , __              _
/|/  \o           | |    |              o
 |___/         _  | |  __|   ,_    __,      _  _
 |    |  /\/  |/  |/  /  |  /  |  /  |  |  / |/ |
 |    |_/ /\_/|__/|__/\_/|_/   |_/\_/|_/|_/  |  |_/

This is a demonstration of Pixeldrain's file viewer.

The website automatically detects what kind of file you requested and prepares a page for viewing it properly. This is what a text file would look like on Pixeldrain. You can upload your own text file at pixeldrain.com/t.

Pixeldrain is a free service for sharing files with large or small groups of people. For more information visit the home page by pressing the home button on the toolbar at the left side of the screen.

Press the Details button or "i" for more info about Pixeldrain's file viewer.
</pre></div>`)
}
