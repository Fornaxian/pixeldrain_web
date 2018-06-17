package templates

import (
	"html/template"
	"time"
)

func (tm *TemplateManager) funcMap() template.FuncMap {
	return template.FuncMap{
		"bgPatternCount": tm.bgPatternCount,
		"debugMode":      tm.debugMode,
		"apiUrl":         tm.apiURL,
	}
}

func (tm *TemplateManager) bgPatternCount() uint8 {
	return uint8(time.Now().UnixNano() % 17)
}

func (tm *TemplateManager) debugMode() bool {
	return tm.debugModeEnabled
}

func (tm *TemplateManager) apiURL() string {
	return tm.externalAPIEndpoint
}
