package webcontroller

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"github.com/julienschmidt/httprouter"
)

// ServeFileViewerDemo is a dummy API response that responds with info about a
// non-existent demo file. This is required by the a-ads ad network to allow for
// automatic checking of the presence of the ad unit on this page.
func (wc *WebController) serveShareXConfig(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	templateData := wc.newTemplateData(w, r)

	w.Header().Add("Content-Disposition", "attachment; filename=pixeldrain.com.sxcu")
	if templateData.Authenticated {
		sess, err := templateData.PixelAPI.PostUserSession("sharex")
		if err != nil {
			log.Error("Failed to create user session: %s", err)
			wc.templates.Run(w, r, "500", templateData)
			return
		}

		fmt.Fprintf(w,
			`{
	"Version": "18.0.1",
	"DestinationType": "ImageUploader, TextUploader, FileUploader",
	"RequestMethod": "PUT",
	"RequestURL": "https://pixeldrain.com/api/file/{filename}",
	"Headers": {
		"Authorization": "Basic %s"
	},
	"Body": "Binary",
	"URL": "https://pixeldrain.com/u/{json:id}",
	"ThumbnailURL": "https://pixeldrain.com/api/file/{json:id}/thumbnail",
	"DeletionURL": "https://pixeldrain.com/u/{json:id}"
}
`,
			base64.StdEncoding.EncodeToString([]byte(
				templateData.User.Username+":"+sess.AuthKey.String(),
			)))
	} else {
		w.Write([]byte(
			`{
	"Version": "18.0.1",
	"DestinationType": "ImageUploader, TextUploader, FileUploader",
	"RequestMethod": "PUT",
	"RequestURL": "https://pixeldrain.com/api/file/{filename}",
	"Body": "Binary",
	"URL": "https://pixeldrain.com/u/{json:id}",
	"ThumbnailURL": "https://pixeldrain.com/api/file/{json:id}/thumbnail"
}
`,
		))
	}
}

func searchAPIError(err error) *pixelapi.Error {
	for {
		if e, ok := err.(pixelapi.Error); ok {
			return &e
		}

		if err = errors.Unwrap(err); err == nil {
			return nil
		}
	}
}

func apiErrorTemplate(err error, w http.ResponseWriter) (templateName string) {
	if apiErr := searchAPIError(err); apiErr != nil {
		switch apiErr.Status {
		case http.StatusNotFound:
			w.WriteHeader(http.StatusNotFound)
			return "404"
		case http.StatusTooManyRequests:
			w.WriteHeader(http.StatusTooManyRequests)
			return "428"
		}
	} else if strings.HasSuffix(err.Error(), "invalid control character in URL") {
		w.WriteHeader(http.StatusNotFound)
		return "404"
	} else {
		log.Error("API request error occurred: %s", err)
		w.WriteHeader(http.StatusInternalServerError)
		return "500"
	}
	return ""
}
