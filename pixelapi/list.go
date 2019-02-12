package pixelapi

import "time"

// API error constants
const (
	ListNotFoundError = "list_not_found"
)

// List information object from the pixeldrain API
type List struct {
	Success     bool       `json:"success"`
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	DateCreated time.Time  `json:"date_created"`
	FileCount   int        `json:"file_count"`
	Files       []ListFile `json:"files,omitempty"`
}

// ListFile information object from the pixeldrain API
type ListFile struct {
	ID           string    `json:"id"`
	DetailHREF   string    `json:"detail_href"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	DateCreated  time.Time `json:"date_created"`
	DateLastView time.Time `json:"date_last_view"`
	Views        int64     `json:"views"`
}

// GetList get a List from the pixeldrain API. Errors will be available through
// List.Error. Standard error checks apply.
func (p *PixelAPI) GetList(id string) (resp *List, err error) {
	resp = &List{}
	err = p.jsonRequest("GET", p.apiEndpoint+"/list/"+id, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
