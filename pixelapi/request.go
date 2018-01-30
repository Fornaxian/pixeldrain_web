package pixelapi

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
)

type ErrorResponse struct {
	ReqError bool
	Success  bool    `json:"success"`
	Value    string  `json:"value"`
	Message  *string `json:"message"`
	ID       *string `json:"id"`
}

func errorResponseFromJSON(j string) *ErrorResponse {
	var r = &ErrorResponse{}
	var err = json.Unmarshal([]byte(j), r)
	if err != nil {
		r.Success = false
		r.ReqError = true
		r.Value = err.Error()
	}
	return r
}
func errorResponseFromError(e error) *ErrorResponse {
	var r = &ErrorResponse{}
	r.Success = false
	r.ReqError = true
	r.Value = e.Error()
	return r
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
