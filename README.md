# pixeldrain_web

Web interface for pixeldrain.com

## Running

Install the package in your $GOPATH with this command:

```
go get fornaxian.tech/pixeldrain_web
```

Enter the directory and run main.go with `go run main.go`. It will generate a
configuration file for you. The default configuration serves the web UI on
http://127.0.0.1:8081. It contains a reverse proxy server which sends all API
requests to the production endpoint at https://pixeldrain.com/api. You can log
in with your real pixeldrain account on your development server by going to
http://127.0.0.1:8081/login.

All except for one of pixeldrain's API endpoints are publicly available. Because
of this you can do everything with the locally hosted instance which you can do
with the real site. The one thing which is missing is the view registration on
the file viewer. Views are verified on the server side, this does not work when
requests are proxied so files you view locally will not be counted.

## Svelte

Most of the frontend uses Svelte. These Svelte files need to be compiled before
they can be used. The Makefile contains from help for this. Running `make run`
starts the dev server on :8081 and compiles and hot-reloads the Svelte
components in the background. To manually compile the Svelte files do `cd svelte
&& npm run build`.
