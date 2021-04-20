package webcontroller

import (
	"strings"

	"fornaxian.tech/pixeldrain_api_client/pixelapi"
)

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

func (wc *WebController) metadataFromFile(f pixelapi.FileInfo) (og ogData) {
	og.addProp("og:title", f.Name)
	og.addProp("og:site_name", "pixeldrain")
	og.addProp("og:description", "This file has been shared with you on pixeldrain")
	og.addProp("og:url", wc.websiteAddress+"/u/"+f.ID)
	og.addProp("description", "This file has been shared with you on pixeldrain")
	og.addName("description", "This file has been shared with you on pixeldrain")
	og.addName("keywords", "pixeldrain,shared,sharing,upload,file,free")
	og.addName("twitter:title", f.Name)
	og.addName("twitter:site", "@Fornax96")
	og.addName("twitter:domain", "pixeldrain.com")

	if strings.HasPrefix(f.MimeType, "image") {
		og.addProp("og:type", "article")
		og.addProp("og:image", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:image:url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:image:secure_url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:image:type", f.MimeType)

		og.addName("twitter:card", "summary_large_image")
		og.addName("twitter:image", wc.websiteAddress+"/api/file/"+f.ID)
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID)
	} else if strings.HasPrefix(f.MimeType, "video") {
		og.addProp("og:type", "video.other")
		og.addProp("og:image", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
		og.addProp("og:video", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:video:url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:video:secure_url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:video:type", f.MimeType)

		og.addName("twitter:card", "player")
		og.addName("twitter:image", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
		og.addName("twitter:player", wc.websiteAddress+"/api/file/"+f.ID)
		og.addName("twitter:player:stream", wc.websiteAddress+"/api/file/"+f.ID)
		og.addName("twitter:player:stream:content_type", f.MimeType)
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
	} else if strings.HasPrefix(f.MimeType, "audio") {
		og.addProp("og:type", "music.song")
		og.addProp("og:audio", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:audio:secure_url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addProp("og:audio:type", f.MimeType)
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
	} else {
		og.addProp("og:type", "website")
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
	}
	return og
}
func (wc *WebController) metadataFromList(l pixelapi.ListInfo) (og ogData) {
	og.addProp("og:type", "website")
	og.addProp("og:title", l.Title)
	og.addProp("og:site_name", "pixeldrain")
	og.addProp("og:description", "A collection of files on pixeldrain")
	og.addProp("description", "A collection of files on pixeldrain")
	og.addName("description", "A collection of files on pixeldrain")
	og.addProp("og:url", wc.websiteAddress+"/l/"+l.ID)
	og.addName("twitter:title", l.Title)
	og.addName("twitter:site", "@Fornax96")
	og.addName("twitter:domain", "pixeldrain.com")
	if l.FileCount > 0 {
		og.addProp("og:image", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
		og.addProp("og:image:url", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
		og.addName("twitter:image", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
	}
	return og
}
