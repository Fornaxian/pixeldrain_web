package main

import (
	"flag"
	"net/http"

	web "fornaxian.com/pixeldrain-web/init"

	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// This is just a launcher for the web server. During testing the app would
// be directly embedded by another Go project. And when deployed it will run
// independently.
func main() {
	var listen = flag.String("listen", ":8081", "The address which the API server will listen on")
	var prefix = flag.String("prefix", "", "Prefix that comes before the API URL")
	flag.Parse()

	r := httprouter.New()

	web.Init(r, *prefix, true)

	err := http.ListenAndServe(*listen, r)

	if err != nil {
		log.Error("Can't listen and serve Pixeldrain Web: %v", err)
	}
}
