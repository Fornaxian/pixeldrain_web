package pixelapi

import (
	"io"
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
	DateUpload    time.Time `json:"date_upload"`
	DateLastView  time.Time `json:"date_last_view"`
	MimeType      string    `json:"mime_type"`
	MimeImage     string    `json:"mime_image"`
	ThumbnailHREF string    `json:"thumbnail_href"`
}

// GetFileInfo gets the FileInfo from the pixeldrain API
func (p *PixelAPI) GetFileInfo(id string, urlParam string) (resp *FileInfo, err error) {
	resp = &FileInfo{}
	err = p.jsonRequest("GET", p.apiEndpoint+"/file/"+id+"/info"+urlParam, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
