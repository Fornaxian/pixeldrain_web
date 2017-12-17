package pixelapi

import (
	"encoding/json"

	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/log"
)

// FileInfo File information object from the pixeldrain API
type FileInfo struct {
	ID            string `json:"id"`
	FileName      string `json:"file_name"`
	DateUpload    int64  `json:"date_upload"`
	DateLastview  int64  `json:"date_last_view"`
	DaysValid     uint16 `json:"days_valid"`
	FileSize      uint64 `json:"file_size"`
	Views         uint   `json:"views"`
	MimeType      string `json:"mime_type"`
	Description   string `json:"description"`
	MimeImage     string `json:"mime_image"`
	ThumbnailHREF string `json:"thumbnail_href"`
}

// GetFileInfo gets the FileInfo from the pixeldrain API
func GetFileInfo(id string) *FileInfo {
	body, err := get(conf.ApiUrlInternal() + "/file/" + id + "/info")

	if err != nil {
		log.Error("req failed: %v", err)
		return nil
	}
	var fileInfo FileInfo
	err = json.Unmarshal([]byte(body), &fileInfo)
	if err != nil {
		log.Error("unmarshal failed: %v. json: %s", err, body)
		return nil
	}
	return &fileInfo
}
