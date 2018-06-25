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
	ID            string    `json:"id"`
	FileName      string    `json:"file_name"`
	DateUpload    time.Time `json:"date_upload"`
	DateLastview  time.Time `json:"date_last_view"`
	DaysValid     uint16    `json:"days_valid"`
	FileSize      uint64    `json:"file_size"`
	Views         uint      `json:"views"`
	MimeType      string    `json:"mime_type"`
	Description   string    `json:"description"`
	MimeImage     string    `json:"mime_image"`
	ThumbnailHREF string    `json:"thumbnail_href"`
}

// GetFileInfo gets the FileInfo from the pixeldrain API
func (p *PixelAPI) GetFileInfo(id string) (resp *FileInfo, err *Error) {
	resp = &FileInfo{}
	err = p.jsonRequest("GET", p.apiEndpoint+"/file/"+id+"/info", resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
