package pixelapi

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/Fornaxian/log"
)

var client = &http.Client{Timeout: time.Minute * 5}

// PixelAPI is the Pixeldrain API client
type PixelAPI struct {
	apiEndpoint string
	apiKey      string
	RealIP      string
}

// New creates a new Pixeldrain API client to query the Pixeldrain API with
func New(apiEndpoint, apiKey string) *PixelAPI {
	return &PixelAPI{apiEndpoint, apiKey, ""}
}

// Error is either an error that occurred during the API request
// (ReqError = true), or an error that was returned from the Pixeldrain API
// (ReqError = false). The Success field is also returned by the Pixeldrain API,
// but since this is struct represents an Error it will usually be false.
//
// When ReqError is true the Value field will contain a Go error message. When
// it's false it will contain a Pixeldrain API error code.
type Error struct {
	ReqError bool
	Success  bool        `json:"success"`
	Value    string      `json:"value"`
	Message  string      `json:"message"`
	Extra    interface{} `json:"extra,omitempty"`
}

func (e Error) Error() string { return e.Value }

// SuccessResponse is a generic response the API returns when the action was
// successful and there is nothing interesting to report
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (p *PixelAPI) jsonRequest(method, url string, target interface{}) error {
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}
	if p.apiKey != "" {
		req.SetBasicAuth("", p.apiKey)
	}
	if p.RealIP != "" {
		req.Header.Set("X-Real-IP", p.RealIP)
	}

	resp, err := client.Do(req)
	if err != nil {
		return Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}

	defer resp.Body.Close()
	return parseJSONResponse(resp, target, true)
}

func (p *PixelAPI) getString(url string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
	if p.apiKey != "" {
		req.SetBasicAuth("", p.apiKey)
	}
	if p.RealIP != "" {
		req.Header.Set("X-Real-IP", p.RealIP)
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	bodyBytes, err := ioutil.ReadAll(resp.Body)

	return string(bodyBytes), err
}

func (p *PixelAPI) getRaw(url string) (io.ReadCloser, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	if p.apiKey != "" {
		req.SetBasicAuth("", p.apiKey)
	}
	if p.RealIP != "" {
		req.Header.Set("X-Real-IP", p.RealIP)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	return resp.Body, err
}

func (p *PixelAPI) form(
	method string,
	url string,
	vals url.Values,
	target interface{},
	catchErrors bool,
) error {
	req, err := http.NewRequest(method, url, strings.NewReader(vals.Encode()))
	if err != nil {
		return Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}
	if p.apiKey != "" {
		req.SetBasicAuth("", p.apiKey)
	}
	if p.RealIP != "" {
		req.Header.Set("X-Real-IP", p.RealIP)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}

	defer resp.Body.Close()
	return parseJSONResponse(resp, target, catchErrors)
}

func parseJSONResponse(resp *http.Response, target interface{}, catchErrors bool) error {
	var err error

	// Test for client side and server side errors
	if catchErrors && resp.StatusCode >= 400 {
		var errResp = Error{
			ReqError: false,
		}
		if err = json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			log.Error("Can't decode this: %v", err)
			return Error{
				ReqError: true,
				Success:  false,
				Value:    err.Error(),
				Message:  err.Error(),
			}
		}
		return errResp
	}

	if target == nil {
		return nil
	}

	if err = json.NewDecoder(resp.Body).Decode(target); err != nil {
		r, _ := ioutil.ReadAll(resp.Body)
		log.Error("Can't decode this: %v. %s", err, r)
		return Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}
	return nil
}
