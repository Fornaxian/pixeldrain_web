package webcontroller

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strings"

	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/pixelapi"

	"github.com/julienschmidt/httprouter"
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
