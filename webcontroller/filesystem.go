package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"fornaxian.tech/log"
	"fornaxian.tech/util"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveDirectory(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var err error
	var td = wc.newTemplateData(w, r)
	var path = strings.TrimPrefix(p.ByName("path"), "/")

	// Prevent search engines from indexing this page for privacy reasons
	w.Header().Set("X-Robots-Tag", "noindex, nofollow")

	if path == "" {
		err = wc.templates.Run(w, r, "404", td)
		if err != nil && !util.IsNetError(err) {
			log.Error("Error executing 404 template: %s", err)
		}
		return
	}

	node, err := td.PixelAPI.GetFilesystemPath(path)
	if apierr := searchAPIError(err); apierr != nil {
		switch apierr.StatusCode {
		case "not_found", "path_not_found":
			wc.serveNotFound(w, r)
		case "forbidden":
			wc.serveForbidden(w, r)
		case "authentication_required":
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		case "unavailable_for_legal_reasons":
			wc.serveUnavailableForLegalReasons(w, r)
		case "permission_denied":
			wc.serveForbidden(w, r)
		}
		return
	} else if err != nil {
		err = wc.templates.Run(w, r, apiErrorTemplate(err, w), td)
		if err != nil && !util.IsNetError(err) {
			log.Error("Error executing api error template: %s", err)
		}
		return
	}

	td.Title = fmt.Sprintf("%s ~ pixeldrain", node.Path[node.BaseIndex].Name)
	td.Other = node
	td.OGData = wc.metadataFromFilesystem(r, node)
	err = wc.templates.Run(w, r, "filesystem", td)
	if err != nil && !util.IsNetError(err) {
		log.Error("Error executing template filesystem: %s", err)
	}
}
