package pixelapi

import (
	"io"
	"net/url"
	"time"
)

// GetFile makes a file download request and returns a readcloser. Don't forget
// to close it!
func (p *PixelAPI) GetFile(id string) (io.ReadCloser, error) {
	return p.getRaw(p.apiEndpoint + "/file/" + id)
}

// FileInfo File information object from the pixeldrain API
type FileInfo struct {
	Success       bool      `json:"success"`
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Size          uint64    `json:"size"`
	Views         int64     `json:"views"`
	BandwidthUsed uint64    `json:"bandwidth_used"`
	DateUpload    time.Time `json:"date_upload"`
	DateLastView  time.Time `json:"date_last_view"`
	MimeType      string    `json:"mime_type"`
	MimeImage     string    `json:"mime_image"`
	ThumbnailHREF string    `json:"thumbnail_href"`

	Availability        string `json:"availability"`
	AvailabilityMessage string `json:"availability_message"`
	AvailabilityName    string `json:"availability_name"`

	CanEdit bool `json:"can_edit"`
}

// GetFileInfo gets the FileInfo from the pixeldrain API
func (p *PixelAPI) GetFileInfo(id string) (resp FileInfo, err error) {
	return resp, p.jsonRequest("GET", p.apiEndpoint+"/file/"+id+"/info", &resp)
}

func (p *PixelAPI) PostFileView(id, viewtoken string) (err error) {
	vals := url.Values{}
	vals.Set("token", viewtoken)
	return p.form("POST", p.apiEndpoint+"/file/"+id+"/view", vals, nil, true)
}
