package pixelapi

// IsAdmin is the response to the /admin/is_admin API
type IsAdmin struct {
	Success bool `json:"success"`
	IsAdmin bool `json:"is_admin"`
}

// UserIsAdmin returns if the logged in user is an admin user
func (p *PixelAPI) UserIsAdmin() (resp IsAdmin, err error) {
	err = p.jsonRequest("GET", p.apiEndpoint+"/admin/is_admin", &resp)
	if err != nil {
		return resp, err
	}
	return resp, nil
}
