package pixelapi

import (
	"net/url"
)

type Registration struct {
	Success bool                `json:"success"`
	Message string              `json:"message,omitempty"`
	Errors  []RegistrationError `json:"errors,omitempty"`
}

type RegistrationError struct {
	Code    string `json:"error_code"`
	Message string `json:"message"`
}

// UserRegister registers a new user on the Pixeldrain server. username and
// password are always required. email is optional, but without it you will
// never be able to reset your password in case you forget it. captcha depends
// on whether reCaptcha is enabled on the Pixeldrain server, this can be checked
// through the GetRecaptcha function.
func (p *PixelAPI) UserRegister(username, email, password, captcha string) (resp *Registration, err *Error) {
	resp = &Registration{}
	var form = url.Values{}
	form.Add("username", username)
	form.Add("email", email)
	form.Add("password", password)
	form.Add("recaptcha_response", captcha)
	err = postForm(p.apiEndpoint+"/user/register", form, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
