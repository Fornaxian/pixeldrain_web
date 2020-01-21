package pixelapi

// Recaptcha stores the reCaptcha site key
type Recaptcha struct {
	SiteKey string `json:"site_key"`
}

// GetRecaptcha gets the reCaptcha site key from the pixelapi server. If
// reCaptcha is disabled the key will be empty
func (p *PixelAPI) GetRecaptcha() (resp Recaptcha, err error) {
	return resp, p.jsonRequest("GET", p.apiEndpoint+"/misc/recaptcha", &resp)
}

// GetMiscViewToken requests a viewtoken from the server. The viewtoken is valid
// for a limited amount of time and can be used to add views to a file.
// Viewtokens can only be requested from localhost
func (p *PixelAPI) GetMiscViewToken() (resp string, err error) {
	return resp, p.jsonRequest("GET", p.apiEndpoint+"/misc/viewtoken", &resp)
}
