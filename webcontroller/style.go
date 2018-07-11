package webcontroller

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) globalCSSHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	w.Header().Add("Content-Type", "text/css; charset=utf-8")

	var selectedStyle PixeldrainStyleSheet

	if cookie, err := r.Cookie("style"); err != nil {
		selectedStyle = DefaultPixeldrainStyle
	} else {
		switch cookie.Value {
		case "solarized_dark":
			selectedStyle = SolarizedDarkStyle
			break
		case "default":
			fallthrough // use default case
		default:
			selectedStyle = DefaultPixeldrainStyle
			break
		}
	}

	// Purple scheme
	// var highlightColor = "843384"
	// var highlightColorDark = "672867"

	var response = fmt.Sprintf(
		`:root {
	--text_color:            %s;
	--input_color:           %s;
	--input_color_dark:      %s;
	--input_text_color:      %s;
	--highlight_color:       %s;
	--highlight_color_dark:  %s;
	--highlight_text_color:  %s;
	--danger_color:          %s;
	--danger_color_dark:     %s;
	--file_background_color: %s;

	--background_color:           %s;
	--body_color:                 %s;
	--accent_color_dark:          %s;
	--accent_color_dark_border:   %s;
	--accent_color_medium:        %s;
	--accent_color_medium_border: %s;
	--accent_color_light:         %s;
	--accent_color_light_border:  %s;

	--shadow_color:     %s;
	--shadow_spread:    %s;
	--shadow_intensity: %s;
}
`,
		selectedStyle.TextColor.CSSString(),
		selectedStyle.InputColor.CSSString(),
		selectedStyle.InputColor.Add(0, 0, -.1).CSSString(),
		selectedStyle.InputTextColor.CSSString(),
		selectedStyle.HighlightColor.CSSString(),
		selectedStyle.HighlightColor.Add(0, 0, -.1).CSSString(),
		selectedStyle.HighlightTextColor.CSSString(),
		selectedStyle.DangerColor.CSSString(),
		selectedStyle.DangerColorDark.CSSString(),
		selectedStyle.FileBackgroundColor.CSSString(),
		selectedStyle.BackgroundColor.CSSString(),
		selectedStyle.BodyColor.CSSString(),
		selectedStyle.AccentColorDark.CSSString(),
		selectedStyle.AccentColorDark.Add(0, 0, .15).CSSString(),
		selectedStyle.AccentColorMedium.CSSString(),
		selectedStyle.AccentColorMedium.Add(0, 0, .15).CSSString(),
		selectedStyle.AccentColorLight.CSSString(),
		selectedStyle.AccentColorLight.Add(0, 0, .15).CSSString(),
		selectedStyle.ShadowColor.CSSString(),
		fmt.Sprintf("%dpx", selectedStyle.ShadowSpread),
		fmt.Sprintf("%dpx", selectedStyle.ShadowIntensity),
	)

	strings.NewReader(response).WriteTo(w)
}

type PixeldrainStyleSheet struct {
	TextColor           HSL
	InputColor          HSL
	InputTextColor      HSL
	HighlightColor      HSL
	HighlightTextColor  HSL
	DangerColor         HSL
	DangerColorDark     HSL
	FileBackgroundColor HSL

	BackgroundColor   HSL
	BodyColor         HSL
	AccentColorDark   HSL
	AccentColorMedium HSL
	AccentColorLight  HSL

	ShadowColor     HSL
	ShadowSpread    int // Pixels
	ShadowIntensity int // Pixels
}
type HSL struct {
	Hue        int
	Saturation float64
	Lightness  float64
}

func (hsl HSL) CSSString() string {
	return fmt.Sprintf(
		"hsl(%d, %.3f%%, %.3f%%)",
		hsl.Hue,
		hsl.Saturation*100,
		hsl.Lightness*100,
	)
}

// Add returns a NEW HSL struct, it doesn't modify the current one
func (hsl HSL) Add(hue int, saturation float64, lightness float64) HSL {
	var new = HSL{
		hsl.Hue + hue,
		hsl.Saturation + saturation,
		hsl.Lightness + lightness,
	}
	// Hue bounds correction
	if new.Hue < 0 {
		new.Hue += 360
	} else if new.Hue > 360 {
		new.Hue -= 360
	}
	// Saturation bounds check
	if new.Saturation < 0 {
		new.Saturation = 0
	} else if new.Saturation > 1 {
		new.Saturation = 1
	}
	// Lightness bounds check
	if new.Lightness < 0 {
		new.Lightness = 0
	} else if new.Lightness > 1 {
		new.Lightness = 1
	}

	return new
}

// Following are all the available styles

var DefaultPixeldrainStyle = PixeldrainStyleSheet{
	TextColor:           HSL{0, 0, .75},
	InputColor:          HSL{0, 0, .38},
	InputTextColor:      HSL{0, 0, 1},
	HighlightColor:      HSL{89, .51, .5},
	HighlightTextColor:  HSL{0, 0, 0},
	DangerColor:         HSL{339, .65, .31},
	DangerColorDark:     HSL{339, .64, .23},
	FileBackgroundColor: HSL{0, 0, 0},

	BackgroundColor:   HSL{0, 0, .05},
	BodyColor:         HSL{20, .05, .14},
	AccentColorDark:   HSL{0, 0, .19},
	AccentColorMedium: HSL{0, 0, .23},
	AccentColorLight:  HSL{0, 0, .28},

	ShadowColor:     HSL{0, 0, 0},
	ShadowSpread:    50,
	ShadowIntensity: 5,
}

var SolarizedDarkStyle = PixeldrainStyleSheet{
	TextColor:           HSL{0, 0, .75},
	InputColor:          HSL{192, .95, .30},
	InputTextColor:      HSL{0, 0, 1},
	HighlightColor:      HSL{145, .63, .42},
	HighlightTextColor:  HSL{0, 0, 1},
	DangerColor:         HSL{343, .63, .42},
	DangerColorDark:     HSL{343, .63, .36},
	FileBackgroundColor: HSL{192, .87, .05},

	BackgroundColor:   HSL{192, 1, .05},
	BodyColor:         HSL{192, 1, .11},
	AccentColorDark:   HSL{192, .87, .09},
	AccentColorMedium: HSL{192, .81, .14},
	AccentColorLight:  HSL{192, .95, .17},

	ShadowColor:     HSL{192, .87, .05},
	ShadowSpread:    50,
	ShadowIntensity: 5,
}
