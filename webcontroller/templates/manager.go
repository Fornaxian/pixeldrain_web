package templates

import (
	"html/template"
	"os"
	"path/filepath"

	"github.com/Fornaxian/log"
)

type TemplateManager struct {
	templates *template.Template

	// Config
	templateDir         string
	externalAPIEndpoint string
	debugModeEnabled    bool
}

func New(templateDir, externalAPIEndpoint string, debugMode bool) *TemplateManager {
	return &TemplateManager{
		templateDir:         templateDir,
		externalAPIEndpoint: externalAPIEndpoint,
		debugModeEnabled:    debugMode,
	}
}

// ParseTemplates parses the templates in the template directory which is
// defined in the config file
func (tm *TemplateManager) ParseTemplates() {
	var templatePaths []string

	filepath.Walk(tm.templateDir, func(path string, f os.FileInfo, err error) error {
		if f.IsDir() {
			return nil
		}
		templatePaths = append(templatePaths, path)
		log.Info("Template found: %s", path)
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
	return tm.templates
}
