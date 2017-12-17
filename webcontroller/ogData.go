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

// FromFile populates the OGData object from FileInfo. It returns itself for
// compactness.
func (d *OGData) FromFile(f pixelapi.FileInfo) *OGData {
	d.Title = f.FileName
	d.Type = "website"
	d.SiteName = "Pixeldrain"
	d.Description = "View " + f.FileName + " on Pixeldrain"
	d.URL = "/u/" + f.ID
	d.Image = "/api/file/" + f.ID + "/thumbnail"
	return d
}

// FromList populated the OGData object from a List. It returns itself for
// compactness.
func (d *OGData) FromList(l pixelapi.List) *OGData {
	d.Title = l.Title
	d.Type = "website"
	d.SiteName = "Pixeldrain"
	d.Description = "View " + l.Title + " on Pixeldrain"
	d.URL = "/l/" + l.ID
	d.Image = "/api/list/" + l.ID + "/thumbnail"
	return d
}
