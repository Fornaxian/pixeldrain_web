package webcontroller

import (
	"io"
	"net/http"

	"fornaxian.com/pixeldrain-web/webcontroller/templates"
)

// ServeFileViewerDemo is a dummy API response that responds with info about a
// non-existent demo file. This is required by the a-ads ad network to allow for
// automatic checking of the presence of the ad unit on this page.
func ServeFileViewerDemo(w http.ResponseWriter) {
	templates.Get().ExecuteTemplate(w, "file_viewer", map[string]interface{}{
		"APIResponse": map[string]interface{}{
			"id":            "demo",
			"file_name":     "Demo file",
			"date_upload":   "2017-01-01 12:34:56",
			"date_lastview": "2017-01-01 12:34:56",
			"file_size":     123456789,
			"views":         1,
			"mime_type":     "text/demo",
			"description":   "A file to demonstrate the viewer page",
			"mime_image":    "/res/img/mime/text.png",
			"thumbnail":     "/res/img/mime/text.png",
		},
		"Type": "file",
	})
}

// ServeFilePreviewDemo serves the content of the demo file. It contains a nice
// message to the human reviewers of the a-ads ad network so they can properly
// categorize the website.
func ServeFilePreviewDemo(w http.ResponseWriter) {
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
