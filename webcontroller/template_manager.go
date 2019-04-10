package webcontroller

import (
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Fornaxian/log"
)

// TemplateManager parses templates and provides utility functions to the
// templates' scripting language
type TemplateManager struct {
	templates *template.Template

	// Config
	templateDir         string
	externalAPIEndpoint string
	debugModeEnabled    bool
}

// NewTemplateManager creates a new template manager
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
		"bgPattern": tm.bgPattern,
		"debugMode": tm.debugMode,
		"apiUrl":    tm.apiURL,
		"pageNr":    tm.pageNr,
		"add":       tm.add,
		"sub":       tm.sub,
	}
}

func (tm *TemplateManager) bgPattern() string {
	var now = time.Now()
	if now.Weekday() == time.Wednesday && now.UnixNano()%10 == 0 {
		return "checker_wednesday.png"
	}
	return fmt.Sprintf("checker%d.png", now.UnixNano()%17)
}
func (tm *TemplateManager) debugMode() bool {
	return tm.debugModeEnabled
}
func (tm *TemplateManager) apiURL() string {
	return tm.externalAPIEndpoint
}
func (tm *TemplateManager) pageNr(s string) (nr int) {
	// Atoi returns 0 on error, which is fine for page numbers
	if nr, _ = strconv.Atoi(s); nr < 0 {
		return 0
	}
	return nr
}
func (tm *TemplateManager) add(a, b int) int {
	return a + b
}
func (tm *TemplateManager) sub(a, b int) int {
	return a - b
}
