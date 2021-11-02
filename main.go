package main

import (
	"flag"
	"net"
	"net/http"

	web "fornaxian.tech/pixeldrain_web/init"
	"fornaxian.tech/util"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

// This is just a launcher for the web server. During testing the app would
// be directly embedded by another Go project. And when deployed it will run
// independently.
func main() {
	var err error
	var sock = flag.Bool("systemd-socket", false, "Enable/disable systemd socket activation")
	var listen = flag.String("listen", ":8081", "The address which the API server will listen on")
	var prefix = flag.String("prefix", "", "Prefix that comes before the API URL")
	flag.Parse()

	var listener net.Listener

	// Serve the API on a socket. If systemd-socket is enabled we'll reuse
	// systemd's socket, else we'll create our own to serve on
	if *sock {
		// Socket activation enabled. Get the provided sockets and serve on them
		if listener, err = util.SystemdSocketByName("pd-web.socket"); err != nil {
			panic("Socket pd-web.socket not found")
		}
	} else {
		// Socket activation disabled, so we create our own listener to serve on
		if listener, err = net.Listen("tcp", *listen); err != nil {
			panic(err)
		}
	}

	var router = httprouter.New()
	web.Init(router, *prefix, true)

	if err = http.Serve(listener, router); err != nil {
		log.Error("Can't listen and serve Pixeldrain Web: %v", err)
	}
}
