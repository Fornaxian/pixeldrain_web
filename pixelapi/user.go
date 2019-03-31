package pixelapi

import (
	"fmt"
	"net/url"
)

// Registration is the response to the UserRegister API. The register API can
// return multiple errors, which will be stored in the Errors array. Check for
// len(Errors) == 0 to see if an error occurred
type Registration struct {
	Success bool    `json:"success"`
	Message string  `json:"message,omitempty"`
	Errors  []Error `json:"errors,omitempty"`
}

// UserRegister registers a new user on the Pixeldrain server. username and
// password are always required. email is optional, but without it you will not
// be able to reset your password in case you forget it. captcha depends on
// whether reCaptcha is enabled on the Pixeldrain server, this can be checked
// through the GetRecaptcha function.
//
// The register API can return multiple errors, which will be stored in the
// Errors array. Check for len(Errors) == 0 to see if an error occurred. If err
// != nil it means a connection error occurred
func (p *PixelAPI) UserRegister(username, email, password, captcha string) (resp *Registration, err error) {
	resp = &Registration{}
	var form = url.Values{}
	form.Add("username", username)
	form.Add("email", email)
	form.Add("password", password)
	form.Add("recaptcha_response", captcha)
	err = p.form("POST", p.apiEndpoint+"/user/register", form, resp, false)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

// Login is the success response to the `user/login` API
type Login struct {
	Success bool   `json:"success"`
	APIKey  string `json:"api_key"`
}

// UserLogin logs a user in with the provided credentials. The response will
// contain the returned API key. If saveKey is true the API key will also be
// saved in the client and following requests with this client will be
// autenticated
func (p *PixelAPI) UserLogin(username, password string, saveKey bool) (resp *Login, err error) {
	resp = &Login{}
	var form = url.Values{}
	form.Add("username", username)
	form.Add("password", password)
	err = p.form("POST", p.apiEndpoint+"/user/login", form, resp, true)
	if err != nil {
		return nil, err
	}
	if saveKey {
		p.apiKey = resp.APIKey
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

func (p *PixelAPI) UserPasswordSet(oldPW, newPW string) (resp *SuccessResponse, err error) {
	resp = &SuccessResponse{}
	var form = url.Values{}
	form.Add("old_password", oldPW)
	form.Add("new_password", newPW)
	err = p.form("PUT", p.apiEndpoint+"/user/password", form, resp, true)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
