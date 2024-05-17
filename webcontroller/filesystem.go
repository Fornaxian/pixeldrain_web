package webcontroller

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
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
			wc.serveNotFound(w, r)
		} else if err.Error() == "forbidden" {
			wc.serveForbidden(w, r)
		} else if err.Error() == "authentication_required" {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
		} else if err.Error() == "unavailable_for_legal_reasons" {
			wc.serveUnavailableForLegalReasons(w, r)
		} else {
			log.Error("Failed to get path: %s", err)
			wc.templates.Get().ExecuteTemplate(w, "500", td)
		}
		return
	}

	td.Title = fmt.Sprintf("%s ~ pixeldrain", node.Path[node.BaseIndex].Name)
	td.Other = node
	td.OGData = wc.metadataFromFilesystem(node)
	err = wc.templates.Get().ExecuteTemplate(w, "filesystem", td)
	if err != nil && !util.IsNetError(err) {
		log.Error("Error executing template filesystem: %s", err)
	}
}

func (wc *WebController) metadataFromFilesystem(f pixelapi.FilesystemPath) (og ogData) {
	var (
		base         = f.Path[f.BaseIndex]
		name         = base.Name
		filetype     = base.Type
		filepath     = url.PathEscape(f.Path[0].ID + base.Path)
		pageurl      = wc.config.WebsiteAddress + "/d/" + filepath
		fileurl      = wc.config.WebsiteAddress + "/api/filesystem/" + filepath
		thumbnailurl = wc.config.WebsiteAddress + "/api/filesystem/" + filepath + "?thumbnail"
	)

	og.addProp("og:title", name)
	og.addProp("og:site_name", "pixeldrain")
	og.addProp("og:description", "This file has been shared with you on pixeldrain")
	og.addProp("og:url", pageurl)
	og.addProp("description", "This file has been shared with you on pixeldrain")
	og.addName("description", "This file has been shared with you on pixeldrain")
	og.addName("keywords", "pixeldrain,shared,sharing,upload,file,free")
	og.addName("twitter:title", name)
	og.addName("twitter:site", "@Fornax96")
	og.addName("twitter:domain", "pixeldrain.com")

	if strings.HasPrefix(filetype, "image") {
		og.addProp("og:type", "article")
		og.addProp("og:image", fileurl)
		og.addProp("og:image:url", fileurl)
		og.addProp("og:image:secure_url", fileurl)
		og.addProp("og:image:type", filetype)

		og.addName("twitter:card", "summary_large_image")
		og.addName("twitter:image", fileurl)
		og.addLink("image_src", fileurl)
	} else if strings.HasPrefix(filetype, "video") {
		og.addProp("og:type", "video.other")
		og.addProp("og:image", thumbnailurl)
		og.addProp("og:video", fileurl)
		og.addProp("og:video:url", fileurl)
		og.addProp("og:video:secure_url", fileurl)
		og.addProp("og:video:type", filetype)

		og.addName("twitter:card", "player")
		og.addName("twitter:image", thumbnailurl)
		og.addName("twitter:player", fileurl)
		og.addName("twitter:player:stream", fileurl)
		og.addName("twitter:player:stream:content_type", filetype)
		og.addLink("image_src", thumbnailurl)
	} else if strings.HasPrefix(filetype, "audio") {
		og.addProp("og:type", "music.song")
		og.addProp("og:image", thumbnailurl)
		og.addProp("og:audio", fileurl)
		og.addProp("og:audio:secure_url", fileurl)
		og.addProp("og:audio:type", filetype)
		og.addLink("image_src", thumbnailurl)
	} else {
		og.addProp("og:type", "website")
		og.addProp("og:image", thumbnailurl)
		og.addLink("image_src", thumbnailurl)
	}
	return og
}
