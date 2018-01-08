package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func GlobalCSSHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	w.Header().Add("Content-Type", "text/css; charset=utf-8")

	var textColor = "c0c0c0"

	// Originals
	var highlightColor = "9FCF6C"
	var highlightColorDark = "5F7747"

	// Purple scheme
	// var highlightColor = "843384"
	// var highlightColorDark = "672867"

	var response = fmt.Sprintf(
		`:root {
	--text_color: #%s;
	--highlight_color: #%s;
	--highlight_color_dark: #%s;
}
`,
		textColor,
		highlightColor,
		highlightColorDark,
	)

	strings.NewReader(response).WriteTo(w)
}
