package pixelapi

// API error constants
const (
	ListNotFoundError = "list_not_found"
)

// List information object from the pixeldrain API
type List struct {
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
func (p *PixelAPI) GetList(id string) (resp *List, err error) {
	resp = &List{}
	err = p.jsonRequest("GET", p.apiEndpoint+"/list/"+id, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
