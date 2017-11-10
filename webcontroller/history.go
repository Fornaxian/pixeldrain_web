package webcontroller

import (
	"net/http"

	"fornaxian.com/pixeldrain-web/conf"
	"fornaxian.com/pixeldrain-web/log"
	"fornaxian.com/pixeldrain-web/webcontroller/templates"
	"github.com/julienschmidt/httprouter"
)

func ServeHistory(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	err := templates.Get().ExecuteTemplate(w, "history-cookies", map[string]interface{}{
		"APIURL": conf.ApiURL(),
	})
	if err != nil {
		log.Error("Error executing template history: %s", err)
	}
}
