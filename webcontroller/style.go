package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func GlobalCSSHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	w.Header().Add("Content-Type", "text/css; charset=utf-8")

	var textColor = "hsl(0, 0%, 75%)"

	// Originals
	var highlightColor = "hsl(89, 51%, 50%)"
	var highlightColorDark = "hsl(89, 51%, 40%)"

	// Purple scheme
	// var highlightColor = "843384"
	// var highlightColorDark = "672867"

	var response = fmt.Sprintf(
		`:root {
	--text_color: %s;
	--highlight_color: %s;
	--highlight_color_dark: %s;
}
`,
		textColor,
		highlightColor,
		highlightColorDark,
	)

	strings.NewReader(response).WriteTo(w)
}
