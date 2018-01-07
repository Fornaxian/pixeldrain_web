package pixelapi

import (
	"encoding/json"

	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/log"
)

// List information object from the pixeldrain API
type List struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	DateCreated int64  `json:"date_created"`
	Files       []ListFile
}

// ListFile information object from the pixeldrain API
type ListFile struct {
	ID              string `json:"id"`
	DetailHREF      string `json:"detail_href"`
	FileName        string `json:"file_name"`
	Description     string `json:"description"`
	DateCreated     int64  `json:"date_created"`
	DateLastView    int64  `json:"date_last_view"`
	ListDescription string `json:"list_description"`
}

// GetList get a List from the pixeldrain API
func GetList(id string) *List {
	body, err := getString(conf.ApiUrlInternal() + "/list/" + id)

	if err != nil {
		log.Error("req failed: %v", err)
		return nil
	}
	var list List
	err = json.Unmarshal([]byte(body), &list)
	if err != nil {
		log.Error("unmarshal failed: %v. json: %s", err, body)
		return nil
	}
	return &list
}
