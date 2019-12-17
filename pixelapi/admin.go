package pixelapi

import "net/url"

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

// AdminGlobal is a global setting in pixeldrain's back-end
type AdminGlobal struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// AdminGlobals is an array of globals
type AdminGlobals struct {
	Success bool          `json:"success"`
	Globals []AdminGlobal `json:"globals"`
}

// AdminGetGlobals returns if the logged in user is an admin user
func (p *PixelAPI) AdminGetGlobals() (resp AdminGlobals, err error) {
	if err = p.jsonRequest("GET", p.apiEndpoint+"/admin/globals", &resp); err != nil {
		return resp, err
	}
	return resp, nil
}

// AdminSetGlobals returns if the logged in user is an admin user
func (p *PixelAPI) AdminSetGlobals(key, value string) (resp SuccessResponse, err error) {
	var form = url.Values{}
	form.Add("key", key)
	form.Add("value", value)
	return resp, p.form("POST", p.apiEndpoint+"/admin/globals", form, &resp, true)
}
