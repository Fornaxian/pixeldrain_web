package pixelapi

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/Fornaxian/log"
)

// PixelAPI is the Pixeldrain API client
type PixelAPI struct {
	apiEndpoint string
}

// New creates a new Pixeldrain API client to query the Pixeldrain API with
func New(apiEndpoint string) *PixelAPI {
	return &PixelAPI{apiEndpoint}
}

type Error struct {
	ReqError bool
	Success  bool   `json:"success"`
	Value    string `json:"value"`
	Message  string `json:"message"`
}

func (e Error) Error() string { return e.Value }

func errorResponseFromJSON(j string) *Error {
	var r = &Error{}
	var err = json.Unmarshal([]byte(j), r)
	if err != nil {
		r.Success = false
		r.ReqError = true
		r.Value = err.Error()
	}
	return r
}
func errorResponseFromError(e error) *Error {
	var r = &Error{}
	r.Success = false
	r.ReqError = true
	r.Value = e.Error()
	return r
}

func getJSON(url string, target interface{}) *Error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return &Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return &Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}

	defer resp.Body.Close()
	var jdec = json.NewDecoder(resp.Body)

	// Test for client side and server side errors
	if resp.StatusCode >= 400 {
		var errResp = &Error{
			ReqError: false,
		}
		err = jdec.Decode(&errResp)
		if err != nil {
			log.Error("Can't decode this: %v", err)
			return &Error{
				ReqError: true,
				Success:  false,
				Value:    err.Error(),
				Message:  err.Error(),
			}
		}
		return errResp
	}

	err = jdec.Decode(target)
	if err != nil {
		r, _ := ioutil.ReadAll(resp.Body)
		log.Error("Can't decode this: %v. %s", err, r)
		return &Error{
			ReqError: true,
			Success:  false,
			Value:    err.Error(),
			Message:  err.Error(),
		}
	}
	return nil
}

func getString(url string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	bodyBytes, err := ioutil.ReadAll(resp.Body)

	return string(bodyBytes), err
}

func getRaw(url string) (io.ReadCloser, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	return resp.Body, err
}
