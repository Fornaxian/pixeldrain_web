package webcontroller

import (
	"net/http"
	"net/url"
	"strings"

	"fornaxian.tech/pixeldrain_api_client/pixelapi"
)

const defaultThemeColour = "#220735"
const defaultHost = "https://pixeldrain.com"

type ogData struct {
	MetaPropRules []ogProp
	MetaNameRules []ogProp
	LinkRules     []ogProp
}

type ogProp struct {
	Key   string
	Value string
}

func (og *ogData) addProp(k, v string) { og.MetaPropRules = append(og.MetaPropRules, ogProp{k, v}) }
func (og *ogData) addName(k, v string) { og.MetaNameRules = append(og.MetaNameRules, ogProp{k, v}) }
func (og *ogData) addLink(k, v string) { og.LinkRules = append(og.LinkRules, ogProp{k, v}) }

func generateOGData(name, filetype, pageurl, fileurl, thumbnailurl, themecolour string) (og ogData) {
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
	og.addName("theme-color", themecolour)

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

func getRequestAddress(r *http.Request) (addr string) {
	if r.Host == "" {
		return defaultHost
	} else if r.TLS == nil {
		return "http://" + r.Host
	} else {
		return "https://" + r.Host
	}
}

func (wc *WebController) metadataFromFile(r *http.Request, f pixelapi.FileInfo) ogData {
	var addr = getRequestAddress(r)
	return generateOGData(
		f.Name,
		f.MimeType,
		addr+"/u/"+f.ID,
		addr+"/api/file/"+f.ID,
		addr+"/api/file/"+f.ID+"/thumbnail",
		defaultThemeColour,
	)
}
func (wc *WebController) metadataFromList(r *http.Request, l pixelapi.ListInfo) ogData {
	var addr = getRequestAddress(r)
	if l.FileCount > 0 {
		return generateOGData(
			l.Title,
			l.Files[0].MimeType,
			addr+"/l/"+l.ID,
			addr+"/api/file/"+l.Files[0].ID,
			addr+"/api/file/"+l.Files[0].ID+"/thumbnail",
			defaultThemeColour,
		)
	}

	var og = ogData{}
	og.addProp("og:type", "website")
	og.addProp("og:title", l.Title)
	og.addProp("og:site_name", "pixeldrain")
	og.addProp("og:description", "A collection of files on pixeldrain")
	og.addProp("description", "A collection of files on pixeldrain")
	og.addName("description", "A collection of files on pixeldrain")
	og.addProp("og:url", addr+"/l/"+l.ID)
	og.addName("twitter:title", l.Title)
	return og
}

func (wc *WebController) metadataFromFilesystem(r *http.Request, f pixelapi.FilesystemPath) (og ogData) {
	var addr = getRequestAddress(r)
	var base = &f.Path[f.BaseIndex]

	// Encode the file path
	var split = strings.Split(base.Path, "/")
	for i := range split {
		split[i] = url.PathEscape(split[i])
	}
	var filepath = strings.Join(split, "/")

	// Get the theme colour
	var colour = defaultThemeColour
	for _, node := range f.Path {
		if node.Properties["branding_enabled"] == "true" &&
			node.Properties["brand_highlight_color"] != "" {
			colour = node.Properties["brand_highlight_color"]
		}
	}

	return generateOGData(
		base.Name,
		base.FileType,
		addr+"/d"+filepath,
		addr+"/api/filesystem"+filepath,
		addr+"/api/filesystem"+filepath+"?thumbnail",
		colour,
	)
}
