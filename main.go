package main

import (
	"net/http"

	web "fornaxian.com/pixeldrain-web/init"

	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// This is just a launcher for the web server. During testing the app would
// be directly embedded by another Go project. And when deployed it will run
// independently.
func main() {
	r := httprouter.New()

	web.Init(r, "")

	err := http.ListenAndServe(":8081", r)

	if err != nil {
		log.Error("Can't listen and serve Pixeldrain Web: %v", err)
	}
}
