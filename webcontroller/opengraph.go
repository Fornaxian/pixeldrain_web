package webcontroller

import (
	"strings"

	"fornaxian.tech/pixeldrain_server/api/restapi/apitype"
)

type ogData struct {
	OGRules      []ogProp
	TwitterRules []ogProp
	LinkRules    []ogProp
}

type ogProp struct {
	Key   string
	Value string
}

func (og *ogData) addOG(k, v string)      { og.OGRules = append(og.OGRules, ogProp{k, v}) }
func (og *ogData) addTwitter(k, v string) { og.TwitterRules = append(og.TwitterRules, ogProp{k, v}) }
func (og *ogData) addLink(k, v string)    { og.LinkRules = append(og.LinkRules, ogProp{k, v}) }

func (wc *WebController) metadataFromFile(f apitype.FileInfo) (og ogData) {
	og.addOG("og:title", f.Name)
	og.addOG("og:site_name", "pixeldrain")
	og.addOG("og:description", "This file has been shared with you on pixeldrain")
	og.addOG("description", "This file has been shared with you on pixeldrain")
	og.addOG("og:url", wc.websiteAddress+"/u/"+f.ID)
	og.addTwitter("twitter:title", f.Name)
	og.addTwitter("twitter:site", "@Fornax96")
	og.addTwitter("twitter:domain", "pixeldrain.com")

	if strings.HasPrefix(f.MimeType, "image") {
		og.addOG("og:type", "article")
		og.addOG("og:image", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:image:url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:image:secure_url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:image:type", f.MimeType)

		og.addTwitter("twitter:card", "summary_large_image")
		og.addTwitter("twitter:image", wc.websiteAddress+"/api/file/"+f.ID)
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID)
	} else if strings.HasPrefix(f.MimeType, "video") {
		og.addOG("og:type", "video.other")
		og.addOG("og:image", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
		og.addOG("og:video", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:video:url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:video:secure_url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:video:type", f.MimeType)

		og.addTwitter("twitter:card", "player")
		og.addTwitter("twitter:image", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
		og.addTwitter("twitter:player", wc.websiteAddress+"/api/file/"+f.ID)
		og.addTwitter("twitter:player:stream", wc.websiteAddress+"/api/file/"+f.ID)
		og.addTwitter("twitter:player:stream:content_type", f.MimeType)
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
	} else if strings.HasPrefix(f.MimeType, "audio") {
		og.addOG("og:type", "music.song")
		og.addOG("og:audio", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:audio:secure_url", wc.websiteAddress+"/api/file/"+f.ID)
		og.addOG("og:audio:type", f.MimeType)
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
	} else {
		og.addOG("og:type", "website")
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+f.ID+"/thumbnail")
	}
	return og
}
func (wc *WebController) metadataFromList(l apitype.ListInfo) (og ogData) {
	og.addOG("og:type", "website")
	og.addOG("og:title", l.Title)
	og.addOG("og:site_name", "pixeldrain")
	og.addOG("og:description", "A collection of files on pixeldrain")
	og.addOG("description", "A collection of files on pixeldrain")
	og.addOG("og:url", wc.websiteAddress+"/l/"+l.ID)
	og.addTwitter("twitter:title", l.Title)
	og.addTwitter("twitter:site", "@Fornax96")
	og.addTwitter("twitter:domain", "pixeldrain.com")
	if l.FileCount > 0 {
		og.addOG("og:image", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
		og.addOG("og:image:url", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
		og.addTwitter("twitter:image", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
		og.addLink("image_src", wc.websiteAddress+"/api/file/"+l.Files[0].ID+"/thumbnail")
	}
	return og
}
