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
	APIKey      string
	RealIP      string
}

// New creates a new Pixeldrain API client to query the Pixeldrain API with
func New(apiEndpoint string) *PixelAPI {
	return &PixelAPI{apiEndpoint: apiEndpoint}
}

// Standard response types

// Error is an error returned by the pixeldrain API. If the request failed
// before it could reach the API the error will be on a different type
type Error struct {
	Status     int    `json:"-"` // One of the http.Status types
	Success    bool   `json:"success"`
	StatusCode string `json:"value"`
	Message    string `json:"message"`

	// In case of the multiple_errors code this array will be populated with
	// more errors
	Errors []Error `json:"errors,omitempty"`

	// Metadata regarding the error
	Extra map[string]interface{} `json:"extra,omitempty"`
}

func (e Error) Error() string { return e.StatusCode }

func (p *PixelAPI) do(r *http.Request) (*http.Response, error) {
	if p.APIKey != "" {
		r.SetBasicAuth("", p.APIKey)
	}
	if p.RealIP != "" {
		r.Header.Set("X-Real-IP", p.RealIP)
	}

	return client.Do(r)
}

func (p *PixelAPI) jsonRequest(method, url string, target interface{}, multiErr bool) error {
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return err
	}
	resp, err := p.do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	return parseJSONResponse(resp, target, multiErr)
}

func (p *PixelAPI) getString(url string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
	resp, err := p.do(req)
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
	resp, err := p.do(req)
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
	multiErr bool,
) error {
	req, err := http.NewRequest(method, url, strings.NewReader(vals.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := p.do(req)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	return parseJSONResponse(resp, target, multiErr)
}

func parseJSONResponse(resp *http.Response, target interface{}, multiErr bool) (err error) {
	// Test for client side and server side errors
	if resp.StatusCode >= 400 {
		errResp := Error{Status: resp.StatusCode}
		if err = json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			return err
		}
		return errResp
	}

	if target == nil {
		return nil
	}

	if err = json.NewDecoder(resp.Body).Decode(target); err != nil {
		r, _ := ioutil.ReadAll(resp.Body)
		log.Error("Can't decode this: %v. %s", err, r)
		return err
	}

	return nil
}
