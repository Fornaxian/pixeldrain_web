package pixelapi

import (
	"fmt"
	"net/url"
	"strconv"
)

// UserRegister registers a new user on the Pixeldrain server. username and
// password are always required. email is optional, but without it you will not
// be able to reset your password in case you forget it. captcha depends on
// whether reCaptcha is enabled on the Pixeldrain server, this can be checked
// through the GetRecaptcha function.
//
// The register API can return multiple errors, which will be stored in the
// Errors array. Check for len(Errors) == 0 to see if an error occurred. If err
// != nil it means a connection error occurred
func (p *PixelAPI) UserRegister(username, email, password, captcha string) (err error) {
	return p.form(
		"POST", p.apiEndpoint+"/user/register",
		url.Values{
			"username":           {username},
			"email":              {email},
			"password":           {password},
			"recaptcha_response": {captcha},
		},
		nil, true,
	)
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
func (p *PixelAPI) UserLogin(username, password string, saveKey bool) (resp Login, err error) {
	var form = url.Values{}
	form.Add("username", username)
	form.Add("password", password)
	if err = p.form("POST", p.apiEndpoint+"/user/login", form, &resp, true); err != nil {
		return resp, err
	}
	if saveKey {
		p.APIKey = resp.APIKey
	}
	return resp, nil
}

// UserInfo contains information about the logged in user
type UserInfo struct {
	Success  bool   `json:"success"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

// UserInfo returns information about the logged in user. Requires an API key
func (p *PixelAPI) UserInfo() (resp UserInfo, err error) {
	return resp, p.jsonRequest("GET", p.apiEndpoint+"/user", &resp, false)
}

// UserSessionDestroy destroys an API key so it can no longer be used to perform
// actions
func (p *PixelAPI) UserSessionDestroy(key string) (err error) {
	return p.jsonRequest("DELETE", p.apiEndpoint+"/user/session", nil, false)
}

// UserFiles is a list of files uploaded by a user
type UserFiles struct {
	Success bool       `json:"success"`
	Files   []FileInfo `json:"files"`
}

// UserFiles gets files uploaded by a user
func (p *PixelAPI) UserFiles(page, limit int) (resp UserFiles, err error) {
	return resp, p.jsonRequest(
		"GET", fmt.Sprintf("%s/user/files?page=%d&limit=%d", p.apiEndpoint, page, limit), &resp, false,
	)
}

// UserLists is a list of lists created by a user
type UserLists struct {
	Success bool   `json:"success"`
	Lists   []List `json:"lists"`
}

// UserLists gets lists created by a user
func (p *PixelAPI) UserLists(page, limit int) (resp UserLists, err error) {
	return resp, p.jsonRequest(
		"GET", fmt.Sprintf("%s/user/lists?page=%d&limit=%d", p.apiEndpoint, page, limit), &resp, false,
	)
}

// UserPasswordSet changes the user's password
func (p *PixelAPI) UserPasswordSet(oldPW, newPW string) (err error) {
	return p.form(
		"PUT", p.apiEndpoint+"/user/password",
		url.Values{"old_password": {oldPW}, "new_password": {newPW}}, nil, true,
	)
}

// UserEmailReset starts the e-mail change process. An email will be sent to the
// new address to verify that it's real. Once the link in the e-mail is clicked
// the key it contains can be sent to the API with UserEmailResetConfirm and the
// change will be applied
func (p *PixelAPI) UserEmailReset(email string, delete bool) (err error) {
	var form = url.Values{}
	form.Add("new_email", email)
	form.Add("delete", strconv.FormatBool(delete))
	return p.form("PUT", p.apiEndpoint+"/user/email_reset", form, nil, true)
}

// UserEmailResetConfirm finishes process of changing a user's e-mail address
func (p *PixelAPI) UserEmailResetConfirm(key string) (err error) {
	return p.form(
		"PUT", p.apiEndpoint+"/user/email_reset_confirm",
		url.Values{"key": {key}}, nil, true,
	)
}

// UserPasswordReset starts the password reset process. An email will be sent
// the user to verify that it really wanted to reset the password. Once the link
// in the e-mail is clicked the key it contains can be sent to the API with
// UserPasswordResetConfirm and a new password can be set
func (p *PixelAPI) UserPasswordReset(email string, recaptchaResponse string) (err error) {
	var form = url.Values{}
	form.Add("email", email)
	form.Add("recaptcha_response", recaptchaResponse)
	return p.form("PUT", p.apiEndpoint+"/user/password_reset", form, nil, true)
}

// UserPasswordResetConfirm finishes process of resetting a user's password. If
// the key is valid the new_password parameter will be saved as the new password
func (p *PixelAPI) UserPasswordResetConfirm(key string, newPassword string) (err error) {
	var form = url.Values{}
	form.Add("key", key)
	form.Add("new_password", newPassword)
	return p.form("PUT", p.apiEndpoint+"/user/password_reset_confirm", form, nil, true)
}

// UserSetUsername changes the user's username.
func (p *PixelAPI) UserSetUsername(username string) (err error) {
	var form = url.Values{}
	form.Add("new_username", username)
	return p.form("PUT", p.apiEndpoint+"/user/username", form, nil, true)
}
