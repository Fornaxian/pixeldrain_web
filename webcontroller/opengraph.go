package webcontroller

import (
	"html/template"
	"strings"

	"fornaxian.com/pixeldrain-web/pixelapi"
)

type ogRule struct {
	Prop    string
	Content string
}

func (o ogRule) HTML() template.HTML {
	return template.HTML(`<meta property="` + o.Prop + `" content="` + o.Content + `"/>` + "\n")
}

type twitterRule struct {
	Name    string
	Content string
}

func (o twitterRule) HTML() template.HTML {
	return template.HTML(`<meta name="` + o.Name + `" content="` + o.Content + `"/>` + "\n")
}

type linkRule struct {
	Rel  string
	HREF string
}

func (o linkRule) HTML() template.HTML {
	return template.HTML(`<link rel="` + o.Rel + `" href="` + o.HREF + `"/>` + "\n")
}

func metadataFromFile(f pixelapi.FileInfo) (meta template.HTML) {
	meta += ogRule{"og:title", f.Name}.HTML()
	meta += ogRule{"og:site_name", "pixeldrain"}.HTML()
	meta += ogRule{"og:description", "View '" + f.Name + "' on pixeldrain"}.HTML()
	meta += ogRule{"description", "View '" + f.Name + "' on pixeldrain"}.HTML()
	meta += ogRule{"og:url", "/u/" + f.ID}.HTML()
	meta += twitterRule{"twitter:title", f.Name}.HTML()
	meta += twitterRule{"twitter:site", "@Fornax96"}.HTML()
	meta += twitterRule{"twitter:domain", "pixeldrain.com"}.HTML()

	if strings.HasPrefix(f.MimeType, "image") {
		meta += ogRule{"og:type", "article"}.HTML()
		meta += ogRule{"og:image", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:image:url", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:image:secure_url", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:image:type", f.MimeType}.HTML()

		meta += twitterRule{"twitter:card", "summary_large_image"}.HTML()
		meta += twitterRule{"twitter:image", "/api/file/" + f.ID}.HTML()
		meta += linkRule{"image_src", "/api/file/" + f.ID}.HTML()
	} else if strings.HasPrefix(f.MimeType, "video") {
		meta += ogRule{"og:type", "video.other"}.HTML()
		meta += ogRule{"og:image", "/api/file/" + f.ID + "/thumbnail"}.HTML()
		meta += ogRule{"og:video", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:video:secure_url", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:video:type", f.MimeType}.HTML()

		meta += twitterRule{"twitter:card", "player"}.HTML()
		meta += twitterRule{"twitter:image", "/api/file/" + f.ID + "/thumbnail"}.HTML()
		meta += twitterRule{"twitter:player", "/api/file/" + f.ID}.HTML()
		meta += twitterRule{"twitter:player:stream", "/api/file/" + f.ID}.HTML()
		meta += twitterRule{"twitter:player:stream:content_type", f.MimeType}.HTML()
		meta += linkRule{"image_src", "/api/file/" + f.ID + "/thumbnail"}.HTML()
	} else if strings.HasPrefix(f.MimeType, "audio") {
		meta += ogRule{"og:type", "music.song"}.HTML()
		meta += ogRule{"og:audio", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:audio:secure_url", "/api/file/" + f.ID}.HTML()
		meta += ogRule{"og:audio:type", f.MimeType}.HTML()
		meta += linkRule{"image_src", "/api/file/" + f.ID + "/thumbnail"}.HTML()
	} else {
		meta += ogRule{"og:type", "website"}.HTML()
		meta += linkRule{"image_src", "/api/file/" + f.ID + "/thumbnail"}.HTML()
	}
	return meta
}
func metadataFromList(l pixelapi.List) (meta template.HTML) {
	meta += ogRule{"og:type", "website"}.HTML()
	meta += ogRule{"og:title", l.Title}.HTML()
	meta += ogRule{"og:site_name", "pixeldrain"}.HTML()
	meta += ogRule{"og:description", "View '" + l.Title + "' on pixeldrain"}.HTML()
	meta += ogRule{"description", "View '" + l.Title + "' on pixeldrain"}.HTML()
	meta += ogRule{"og:url", "/l/" + l.ID}.HTML()
	meta += twitterRule{"twitter:title", l.Title}.HTML()
	meta += twitterRule{"twitter:site", "@Fornax96"}.HTML()
	meta += twitterRule{"twitter:domain", "pixeldrain.com"}.HTML()
	if l.FileCount > 0 {
		meta += ogRule{"og:image", "/api/file/" + l.Files[0].ID + "/thumbnail"}.HTML()
		meta += ogRule{"og:image:url", "/api/file/" + l.Files[0].ID + "/thumbnail"}.HTML()
		meta += twitterRule{"twitter:image", "/api/file/" + l.Files[0].ID + "/thumbnail"}.HTML()
		meta += linkRule{"image_src", "/api/file/" + l.Files[0].ID + "/thumbnail"}.HTML()
	}
	return meta
}
