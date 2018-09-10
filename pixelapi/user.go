package pixelapi

import (
	"fmt"
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
func (p *PixelAPI) UserRegister(username, email, password, captcha string) (resp *Registration, err error) {
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

// UserInfo returns information about the logged in user. Requires an API key
func (p *PixelAPI) UserInfo() (resp *UserInfo, err error) {
	resp = &UserInfo{}
	err = p.jsonRequest("GET", p.apiEndpoint+"/user", resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// UserSessionDestroy destroys an API key so it can no longer be used to perform
// actions
func (p *PixelAPI) UserSessionDestroy(key string) (resp *SuccessResponse, err error) {
	resp = &SuccessResponse{}
	err = p.jsonRequest("DELETE", p.apiEndpoint+"/user/session", resp)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

type UserFiles struct {
	Success bool       `json:"success"`
	Files   []FileInfo `json:"files"`
}

func (p *PixelAPI) UserFiles(page, limit int) (resp *UserFiles, err error) {
	resp = &UserFiles{Files: make([]FileInfo, 0)}
	err = p.jsonRequest(
		"GET",
		fmt.Sprintf("%s/user/files?page=%d&limit=%d", p.apiEndpoint, page, limit),
		resp,
	)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

type UserLists struct {
	Success bool   `json:"success"`
	Lists   []List `json:"lists"`
}

func (p *PixelAPI) UserLists(page, limit int) (resp *UserLists, err error) {
	resp = &UserLists{Lists: make([]List, 0)}
	err = p.jsonRequest(
		"GET",
		fmt.Sprintf("%s/user/lists?page=%d&limit=%d", p.apiEndpoint, page, limit),
		resp,
	)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
