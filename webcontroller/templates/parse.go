package templates

import (
	"html/template"
	"os"
	"path/filepath"

	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/log"
)

var templates *template.Template
var templatePaths []string

// ParseTemplates parses the templates in the template directory which is
// defined in the config file
func ParseTemplates() {
	filepath.Walk(conf.TemplateDir(), func(path string, f os.FileInfo, err error) error {
		if f.IsDir() {
			return nil
		}
		templatePaths = append(templatePaths, path)
		log.Info("Template found: %s", path)
		return nil
	})

	tpl := template.New("")

	// Import template functions from funcs.go
	tpl = tpl.Funcs(funcMap)

	var err error
	tpl, err = tpl.ParseFiles(templatePaths...)
	if err != nil {
		log.Error("Template parsing failed: %v", err)
	}

	// Swap out the old templates with the new templates, to minimize
	// modifications to the original variable.
	templates = tpl
}

// Get returns the templates, so they can be used to render views
func Get() *template.Template {
	return templates
}
