package pixelapi

import (
	"encoding/json"

	"fornaxian.com/pixeldrain-web/conf"
)

// API error constants
const (
	ListNotFoundError = "list_not_found"
)

// List information object from the pixeldrain API
type List struct {
	Error       *ErrorResponse
	Success     bool   `json:"success"`
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

// GetList get a List from the pixeldrain API. Errors will be available through
// List.Error. Standard error checks apply.
func GetList(id string) *List {
	var list = &List{}
	body, err := getString(conf.ApiUrlInternal() + "/list/" + id)
	if err != nil {
		list.Error = errorResponseFromError(err)
		return list
	}

	err = json.Unmarshal([]byte(body), list)
	if err != nil {
		list.Error = errorResponseFromError(err)
		return list
	}

	if !list.Success {
		list.Error = errorResponseFromJSON(body)
	}
	return list
}
