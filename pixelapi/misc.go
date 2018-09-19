package pixelapi

// Recaptcha stores the reCaptcha site key
type Recaptcha struct {
	SiteKey string `json:"site_key"`
}

// GetRecaptcha gets the reCaptcha site key from the pixelapi server. If
// reCaptcha is disabled the key will be empty
func (p *PixelAPI) GetRecaptcha() (resp Recaptcha, err error) {
	err = p.jsonRequest("GET", p.apiEndpoint+"/misc/recaptcha", &resp)
	if err != nil {
		return resp, err
	}
	return resp, nil
}
