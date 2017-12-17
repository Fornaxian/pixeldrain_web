package templates

import (
	"html/template"
	"time"

	"fornaxian.com/pixeldrain-web/conf"
)

var funcMap = template.FuncMap{
	"bgPatternCount": bgPatternCount,
	"debugMode":      debugMode,
	"apiUrl":         apiURL,
}

func bgPatternCount() uint8 {
	return uint8(time.Now().UnixNano() % 16)
}

func debugMode() bool {
	return conf.DebugMode()
}

func apiURL() string {
	return conf.ApiUrlExternal()
}
