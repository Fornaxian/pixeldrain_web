package webcontroller

import (
	"fmt"
	"net/http"
)

func userStyle(r *http.Request) pixeldrainStyleSheet {
	// Get the chosen style from the URL
	var style = r.URL.Query().Get("style")

	// If the URL style was empty use the cookie value
	if style == "" {
		if cookie, err := r.Cookie("style"); err == nil {
			style = cookie.Value
		}
	}

	switch style {
	case "classic":
		return pixeldrainClassicStyle
	case "solarized_dark":
		return solarizedDarkStyle
	case "sunny":
		return sunnyPixeldrainStyle
	case "maroon":
		return maroonStyle
	case "hacker":
		return hackerStyle
	case "canta":
		return cantaPixeldrainStyle
	case "arc":
		return arcPixeldrainStyle
	case "deepsea":
		return deepseaPixeldrainStyle
	case "default":
		fallthrough // use default case
	default:
		// return defaultPixeldrainStyle
		return maroonStyle
	}
}

type pixeldrainStyleSheet struct {
	TextColor                hsl
	InputColor               hsl // Buttons, text fields
	InputTextColor           hsl
	HighlightColor           hsl // Links, highlighted buttons, list navigation
	HighlightTextColor       hsl // Text on buttons
	DangerColor              hsl
	ScrollbarForegroundColor hsl
	ScrollbarHoverColor      hsl
	ScrollbarBackgroundColor hsl

	Layer1Color hsl // Deepest and darkest layer
	Layer2Color hsl
	Layer3Color hsl
	Layer4Color hsl // Highest and brightest layer

	ShadowColor hsl
}

func (s pixeldrainStyleSheet) String() string {
	return fmt.Sprintf(
		`:root {
	--text_color:                 #%s;
	--input_color:                #%s;
	--input_color_dark:           #%s;
	--input_text_color:           #%s;
	--highlight_color:            #%s;
	--highlight_color_dark:       #%s;
	--highlight_text_color:       #%s;
	--danger_color:               #%s;
	--danger_color_dark:          #%s;
	--scrollbar_foreground_color: #%s;
	--scrollbar_hover_color:      #%s;
	--scrollbar_background_color: #%s;

	--layer_1_color:        #%s;
	--layer_1_color_border: #%s;
	--layer_2_color:        #%s;
	--layer_2_color_border: #%s;
	--layer_3_color:        #%s;
	--layer_3_color_border: #%s;
	--layer_4_color:        #%s;
	--layer_4_color_border: #%s;

	--shadow_color:     #%s;
}`,
		s.TextColor.RGB(),
		s.InputColor.RGB(),
		s.InputColor.add(0, 0, -.02).RGB(),
		s.InputTextColor.RGB(),
		s.HighlightColor.RGB(),
		s.HighlightColor.add(0, 0, -.02).RGB(),
		s.HighlightTextColor.RGB(),
		s.DangerColor.RGB(),
		s.DangerColor.add(0, 0, -.02).RGB(),
		s.ScrollbarForegroundColor.RGB(),
		s.ScrollbarHoverColor.RGB(),
		s.ScrollbarBackgroundColor.RGB(),
		s.Layer1Color.RGB(),
		s.Layer1Color.add(0, 0, .05).RGB(),
		s.Layer2Color.RGB(),
		s.Layer2Color.add(0, 0, .05).RGB(),
		s.Layer3Color.RGB(),
		s.Layer3Color.add(0, 0, .05).RGB(),
		s.Layer4Color.RGB(),
		s.Layer4Color.add(0, 0, .05).RGB(),
		s.ShadowColor.RGB(),
	)
}

type hsl struct {
	Hue        int
	Saturation float64
	Lightness  float64
}

func (orig hsl) RGB() string {
	var r, g, b, q, p float64
	var h, s, l = float64(orig.Hue) / 360, orig.Saturation, orig.Lightness

	if s == 0 {
		r, g, b = l, l, l
	} else {
		var hue2rgb = func(p, q, t float64) float64 {
			if t < 0 {
				t++
			}
			if t > 1 {
				t--
			}

			if t < 1.0/6.0 {
				return p + (q-p)*6*t
			} else if t < 1.0/2.0 {
				return q
			} else if t < 2.0/3.0 {
				return p + (q-p)*(2.0/3.0-t)*6
			}
			return p
		}

		if l < 0.5 {
			q = l * (1 + s)
		} else {
			q = l + s - l*s
		}

		p = 2*l - q
		r = hue2rgb(p, q, h+1.0/3.0)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h-1.0/3.0)
	}

	return fmt.Sprintf("%02x%02x%02x", int(r*255), int(g*255), int(b*255))
}

// Add returns a NEW HSL struct, it doesn't modify the current one
func (h hsl) add(hue int, saturation float64, lightness float64) hsl {
	var new = hsl{
		h.Hue + hue,
		h.Saturation + saturation,
		h.Lightness + lightness,
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

var defaultPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{266, .85, .38},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{117, .63, .46},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{357, .63, .46},
	ScrollbarForegroundColor: hsl{266, .85, .38},
	ScrollbarHoverColor:      hsl{266, .85, .50},
	ScrollbarBackgroundColor: hsl{275, .75, .06},

	Layer1Color: hsl{275, .8, .07},
	Layer2Color: hsl{275, .75, .12},
	Layer3Color: hsl{275, .7, .18},
	Layer4Color: hsl{275, .65, .24},

	ShadowColor: hsl{0, 0, 0},
}

var pixeldrainClassicStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{0, 0, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{89, .60, .45},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{339, .65, .31},
	ScrollbarForegroundColor: hsl{0, 0, .35},
	ScrollbarHoverColor:      hsl{0, 0, .45},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color: hsl{0, 0, .08},
	Layer2Color: hsl{0, 0, .11},
	Layer3Color: hsl{0, 0, .15},
	Layer4Color: hsl{0, 0, .18},

	ShadowColor: hsl{0, 0, 0},
}

var sunnyPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .1},
	InputColor:               hsl{0, 0, .96}, // hsl(0, 0%, 96%)
	InputTextColor:           hsl{0, 0, .1},
	HighlightColor:           hsl{89, .74, .5}, // hsl(89, 73%, 50%)
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{345, .99, .33}, // hsl(345, 99%, 33%)
	ScrollbarForegroundColor: hsl{0, 0, .30},
	ScrollbarHoverColor:      hsl{0, 0, .40},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color: hsl{0, 0, .98}, // hsl(0, 0%, 13%)
	Layer2Color: hsl{0, 1, 1},
	Layer3Color: hsl{0, 1, 1},
	Layer4Color: hsl{0, 1, 1},

	ShadowColor: hsl{0, 0, 0.5},
}

var solarizedDarkStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .75},
	InputColor:               hsl{192, .95, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{145, .63, .42},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{343, .63, .42},
	ScrollbarForegroundColor: hsl{192, .95, .30},
	ScrollbarHoverColor:      hsl{192, .95, .40},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color: hsl{192, .87, .09},
	Layer2Color: hsl{192, .81, .14},
	Layer3Color: hsl{192, .95, .17},
	Layer4Color: hsl{192, .99, .19},

	ShadowColor: hsl{0, 0, 0},
}

var maroonStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{0, .75, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{0, 1, .4},
	HighlightTextColor:       hsl{0, 0, 1},
	DangerColor:              hsl{0, .1, .1},
	ScrollbarForegroundColor: hsl{0, .75, .3},
	ScrollbarHoverColor:      hsl{0, .75, .4},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color: hsl{0, .5, .05},
	Layer2Color: hsl{0, .6, .08}, // hsl{0, .8, .15},
	Layer3Color: hsl{0, .9, .14},
	Layer4Color: hsl{0, .9, .20},

	ShadowColor: hsl{0, 0, 0},
}

var hackerStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{120, .5, .1}, // hsl(120, 50%, 10%)
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{120, 1, .5},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{0, 1, .4},
	ScrollbarForegroundColor: hsl{120, .5, .25},
	ScrollbarHoverColor:      hsl{120, .5, .35},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color: hsl{0, 0, 0},
	Layer2Color: hsl{0, 0, .03},
	Layer3Color: hsl{120, .3, .08},
	Layer4Color: hsl{120, .5, .12},

	ShadowColor: hsl{0, 0, 0},
}

var cantaPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{167, .06, .30}, // hsl(167, 6%, 30%)
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{165, 1, .40}, // hsl(165, 100%, 40%)
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{40, 1, .5},     // hsl(40, 100%, 50%)
	ScrollbarForegroundColor: hsl{204, .05, .78}, // hsl(204, 5%, 78%)
	ScrollbarHoverColor:      hsl{204, .05, .88},
	ScrollbarBackgroundColor: hsl{200, .13, .27}, // hsl(200, 13%, 27%)

	Layer1Color: hsl{180, .04, .16},
	Layer2Color: hsl{168, .05, .21},
	Layer3Color: hsl{170, .05, .26},
	Layer4Color: hsl{163, .04, .31},

	ShadowColor: hsl{0, 0, 0},
}

var arcPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, 1},
	InputColor:               hsl{218, .16, .30},
	InputTextColor:           hsl{215, .19, .75},
	HighlightColor:           hsl{212, .71, .60},
	HighlightTextColor:       hsl{215, .19, .9},
	DangerColor:              hsl{357, .53, .57}, // hsl(357, 53%, 57%)
	ScrollbarForegroundColor: hsl{222, .08, .44}, // hsl(222, 8%, 44%)
	ScrollbarHoverColor:      hsl{222, .08, .54}, // hsl(222, 8%, 44%)
	ScrollbarBackgroundColor: hsl{223, .12, .2},  // hsl(223, 12%, 29%)

	Layer1Color: hsl{215, .17, .19},
	Layer2Color: hsl{227, .14, .25}, // hsl(227, 14%, 25%)
	Layer3Color: hsl{223, .12, .29},
	Layer4Color: hsl{223, .10, .32},

	ShadowColor: hsl{0, 0, 0},
}

var deepseaPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .7},
	InputColor:               hsl{41, .58, .47},
	InputTextColor:           hsl{0, 0, 0},
	HighlightColor:           hsl{5, .77, .55},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{5, .77, .55},
	ScrollbarForegroundColor: hsl{162, .28, .23}, // hsl(162, 28%, 23%)
	ScrollbarHoverColor:      hsl{12, .38, .26},  // hsl(12, 38%, 26%)
	ScrollbarBackgroundColor: hsl{0, 0, .11},     // hsl(0, 0%, 11%)

	Layer1Color: hsl{160, .27, .05},
	Layer2Color: hsl{163, .26, .09}, // hsl(163, 26%, 11%)
	Layer3Color: hsl{161, .28, .12}, // hsl(161, 28%, 14%)
	Layer4Color: hsl{161, .32, .15},

	ShadowColor: hsl{0, 0, 0},
}
