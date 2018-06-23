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
	err = p.postForm(p.apiEndpoint+"/user/register", form, resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// UserInfo contains information about the logged in user
type UserInfo struct {
	Success  bool   `json:"success"`
	Username string `json:"username"`
}

// UserInfo returns information about the logged in user. Required an API key
func (p *PixelAPI) UserInfo() (resp *UserInfo, err *Error) {
	resp = &UserInfo{}
	err = p.jsonRequest("GET", p.apiEndpoint+"/user", resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// UserSessionDestroy destroys an API key so it can no longer be used to perform
// actions
func (p *PixelAPI) UserSessionDestroy(key string) (resp *SuccessResponse, err *Error) {
	resp = &SuccessResponse{}
	err = p.jsonRequest("DELETE", p.apiEndpoint+"/user/session", resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
