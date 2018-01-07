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

	"fornaxian.com/pixeldrain-api/log"
	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/pixelapi"

	"github.com/julienschmidt/httprouter"
	"github.com/timakin/gonvert"
)

// ServeFilePreview controller for GET /u/:id/preview
func ServeFilePreview(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	if p.ByName("id") == "demo" {
		ServeFilePreviewDemo(w) // Required for a-ads.com quality check
		return
	}

	inf := pixelapi.GetFileInfo(p.ByName("id")) // TODO: Error handling
	if inf == nil {
		ServeNotFound(w, r)
		return
	}

	var fp FilePreview
	io.WriteString(w, fp.Run(inf))
}

type FilePreview struct {
	FileInfo    *pixelapi.FileInfo
	FileURL     string
	DownloadURL string
}

func (f FilePreview) Run(inf *pixelapi.FileInfo) string {
	f.FileInfo = inf
	f.FileURL = conf.ApiUrlExternal() + "/file/" + f.FileInfo.ID
	f.DownloadURL = conf.ApiUrlExternal() + "/file/" + f.FileInfo.ID + "/download"

	if strings.HasPrefix(f.FileInfo.MimeType, "image") {
		return f.image()
	}
	if strings.HasPrefix(f.FileInfo.MimeType, "video") {
		return f.video()
	}
	if strings.HasPrefix(f.FileInfo.MimeType, "audio") {
		return f.audio()
	}
	if strings.HasPrefix(f.FileInfo.MimeType, "text") {
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
		switch filepath.Ext(f.FileInfo.FileName) {
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

func (f FilePreview) image() string {
	return fmt.Sprintf(`<div class="image-container">
<img id="displayImg" src="%s" class="pannable drop-shadow"/>
</div>
<script src="/res/viewer-scripts/image.js"></script>`,
		f.FileURL)
}

func (f FilePreview) audio() string {
	return fmt.Sprintf(`<div class="image-container">
<br/><br/>
<img src="/res/img/mime/audio.png" alt="Audio"/>
<br/>%s<br/><br/>
<audio id="audioPlayer" controls="controls" autoplay="autoplay" style="width:90%%;">
<source src="%s" />
</audio>
</div>
<script src="/res/viewer-scripts/audio.js"></script>`,
		f.FileInfo.FileName,
		f.FileURL,
	)
}

func (f FilePreview) video() string {
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

func (f FilePreview) pdf() string {
	u, _ := url.Parse(f.FileURL)
	return f.frame("/res/misc/pdf-viewer/web/viewer.html?file=" + u.String())
}

func (f FilePreview) text() string {
	htmlOut := `<div class="text-container">
<pre class="pre-container %s" style="width: 100%%;">%s</pre>
</div>`

	if f.FileInfo.FileSize > 1e6 { // Prevent out of memory errors
		return fmt.Sprintf(htmlOut, "",
			"File is too large to view online.\nPlease download and view it locally.",
		)
	}

	body, err := pixelapi.GetFile(f.FileInfo.ID)
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

	result = html.EscapeString(result)

	var prettyPrint string
	if f.FileInfo.MimeType != "text/plain" {
		prettyPrint = "prettyprint linenums"
		htmlOut += `<script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=desert"></script>`
	}
	return fmt.Sprintf(htmlOut, prettyPrint, result)
}

func (f FilePreview) frame(url string) string {
	return fmt.Sprintf(`<iframe src="%s" class="image-container"
seamless="seamless" frameborder="0" allowtransparency="true"
</iframe>`,
		url,
	)
}

func (f FilePreview) def() string {
	return fmt.Sprintf(
		`%s<br/>%s<br/><a href="%s"><img src="%s" class="image"></a>`,
		f.FileInfo.FileName,
		f.FileInfo.MimeType,
		f.DownloadURL,
		conf.ApiUrlExternal()+f.FileInfo.ThumbnailHREF,
	)
}
