package conf

import (
	"os"
	"sort"

	"fornaxian.com/pixeldrain-web/log"
	"github.com/spf13/viper"
)

var vi *viper.Viper

var defaultConfig = `# Pixeldrain Web UI server configuration
api_url = "http://127.0.0.1:8080/api"
static_resource_dir = "res/static"
template_dir = "res/template"
debug_mode = false`

// Init reads the config file
func Init() {
	if vi != nil {
		log.Error("Config already initialized, can't ititialize again")
		return
	}

	vi = viper.New()
	vi.SetConfigType("toml")
	vi.SetConfigName("pdwebconf")

	vi.AddConfigPath(".")
	vi.AddConfigPath("./conf")
	vi.AddConfigPath("/etc")
	vi.AddConfigPath("/usr/local/etc")

	vi.SetDefault("api_url", "http://127.0.0.1:8080/api")
	vi.SetDefault("static_resource_dir", "./res/static")
	vi.SetDefault("template_dir", "./res/template")
	vi.SetDefault("debug_mode", false)

	err := vi.ReadInConfig()

	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			writeCfg()
			log.Warn("Generated config file \"pdapiconf.toml\", please edit and run again.")
			os.Exit(0)
		} else if _, ok := err.(viper.ConfigParseError); ok {
			log.Error("Could not parse config file: ", err)
		} else {
			log.Error("Unknown error occured while reading config file: ", err)
		}
	}

	log.Info("Web UI configuration:")
	keys := vi.AllKeys()
	numKeys := len(keys)
	sort.Strings(keys)
	for i, v := range keys {
		if i == numKeys-1 {
			log.Info("└%21s: %v", v, vi.Get(v))
		} else {
			log.Info("├%21s: %v", v, vi.Get(v))
		}
	}
}

func writeCfg() {
	file, err := os.Create("pdwebconf.toml")

	if err != nil {
		log.Error("Could not create config file: ", err)
	}

	file.WriteString(defaultConfig)

	file.Close()
}

// ApiURL returns the API URL
func ApiURL() string {
	return vi.GetString("api_url")
}
func StaticResourceDir() string {
	return vi.GetString("static_resource_dir")
}
func TemplateDir() string {
	return vi.GetString("template_dir")
}
func DebugMode() bool {
	return vi.GetBool("debug_mode")
}
