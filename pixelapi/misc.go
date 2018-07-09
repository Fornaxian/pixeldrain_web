package pixelapi

type Recaptcha struct {
	SiteKey string `json:"site_key"`
}

func (p *PixelAPI) GetRecaptcha() (resp *Recaptcha, err error) {
	err = p.jsonRequest("GET", p.apiEndpoint+"/misc/recpatcha", resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
