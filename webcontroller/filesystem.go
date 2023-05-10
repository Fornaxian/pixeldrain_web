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

	if path == "" {
		wc.templates.Get().ExecuteTemplate(w, "404", td)
		return
	}

	node, err := td.PixelAPI.GetFilesystemPath(path)
	if err != nil {
		if err.Error() == "not_found" || err.Error() == "path_not_found" {
			wc.templates.Get().ExecuteTemplate(w, "404", td)
		} else if err.Error() == "authentication_required" {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		} else {
			log.Error("Failed to get path: %s", err)
			wc.templates.Get().ExecuteTemplate(w, "500", td)
		}
		return
	}

	td.Title = fmt.Sprintf("%s ~ pixeldrain", node.Path[node.BaseIndex].Name)
	td.Other = node
	err = wc.templates.Get().ExecuteTemplate(w, "filesystem", td)
	if err != nil && !util.IsNetError(err) {
		log.Error("Error executing template filesystem: %s", err)
	}
}
