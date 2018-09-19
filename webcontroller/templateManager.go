package webcontroller

import (
	"html/template"
	"os"
	"path/filepath"
	"time"

	"github.com/Fornaxian/log"
)

type TemplateManager struct {
	templates *template.Template

	// Config
	templateDir         string
	externalAPIEndpoint string
	debugModeEnabled    bool
}

func NewTemplateManager(templateDir, externalAPIEndpoint string, debugMode bool) *TemplateManager {
	return &TemplateManager{
		templateDir:         templateDir,
		externalAPIEndpoint: externalAPIEndpoint,
		debugModeEnabled:    debugMode,
	}
}

// ParseTemplates parses the templates in the template directory which is
// defined in the config file.
// If silent is false it will print an info log message for every template found
func (tm *TemplateManager) ParseTemplates(silent bool) {
	var templatePaths []string

	filepath.Walk(tm.templateDir, func(path string, f os.FileInfo, err error) error {
		if f.IsDir() {
			return nil
		}
		templatePaths = append(templatePaths, path)
		if !silent {
			log.Info("Template found: %s", path)
		}
		return nil
	})

	tpl := template.New("")

	// Import template functions from funcs.go
	tpl = tpl.Funcs(tm.funcMap())

	var err error
	tpl, err = tpl.ParseFiles(templatePaths...)
	if err != nil {
		log.Error("Template parsing failed: %v", err)
	}

	// Swap out the old templates with the new templates, to minimize
	// modifications to the original variable.
	tm.templates = tpl
}

// Get returns the templates, so they can be used to render views
func (tm *TemplateManager) Get() *template.Template {
	if tm.debugModeEnabled {
		tm.ParseTemplates(true)
	}
	return tm.templates
}

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
