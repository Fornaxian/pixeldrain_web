package webcontroller

import (
	"fornaxian.com/pixeldrain-web/pixelapi"
)

// OGData holds all information needed to populate the various meta tags on the
// file and list viewer
type OGData struct {
	Title       string
	Type        string
	SiteName    string
	Description string
	URL         string
	Image       string
}

// OpenGraphFromFile populates the OGData object from FileInfo
func OpenGraphFromFile(f pixelapi.FileInfo) (og OGData) {
	og.Title = f.Name
	og.Type = "website"
	og.SiteName = "Pixeldrain"
	og.Description = "View " + f.Name + " on Pixeldrain"
	og.URL = "/u/" + f.ID
	og.Image = "/api/file/" + f.ID + "/thumbnail"
	return og
}

// OpenGraphFromList populates the OGData object from a List
func OpenGraphFromList(l pixelapi.List) (og OGData) {
	og.Title = l.Title
	og.Type = "website"
	og.SiteName = "Pixeldrain"
	og.Description = "View " + l.Title + " on Pixeldrain"
	og.URL = "/l/" + l.ID
	og.Image = "/api/file/" + l.Files[0].ID + "/thumbnail"
	return og
}
