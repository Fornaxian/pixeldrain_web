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
	templateData, err := wc.newTemplateData(w, r)
	if tpl := apiErrorTemplate(err, w); tpl != "" {
		wc.templates.Run(w, r, tpl, templateData)
		return
	}

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

func apiErrorTemplate(err error, w http.ResponseWriter) (templateName string) {
	if err == nil {
		return ""
	}

	var status = http.StatusInternalServerError
	if apiErr, ok := errors.AsType[pixelapi.Error](err); ok {
		status = apiErr.Status
	} else if strings.HasSuffix(err.Error(), "invalid control character in URL") {
		status = http.StatusNotFound
	} else {
		log.Error("API request error occurred: %s", err)
	}

	w.WriteHeader(status)

	switch status {
	case http.StatusNotFound:
		return "404"
	case http.StatusForbidden:
		return "403"
	case http.StatusUnavailableForLegalReasons:
		return "451"
	case http.StatusTooManyRequests:
		return "429"
	}

	// Any other status gets the generic error page. Never return an empty
	// template name here, that renders a blank page
	return "500"
}
