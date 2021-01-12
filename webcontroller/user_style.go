package webcontroller

import (
	"fmt"
	"net/http"
)

func userStyle(r *http.Request) (style pixeldrainStyleSheet) {
	var selectedStyle pixeldrainStyleSheet

	if cookie, err := r.Cookie("style"); err != nil {
		selectedStyle = defaultPixeldrainStyle
	} else {
		switch cookie.Value {
		case "solarized_dark":
			selectedStyle = solarizedDarkStyle
		case "sunny":
			selectedStyle = sunnyPixeldrainStyle
		case "maroon":
			selectedStyle = maroonStyle
		case "hacker":
			selectedStyle = hackerStyle
		case "canta":
			selectedStyle = cantaPixeldrainStyle
		case "arc":
			selectedStyle = arcPixeldrainStyle
		case "deepsea":
			selectedStyle = deepseaPixeldrainStyle
		case "default":
			fallthrough // use default case
		default:
			selectedStyle = defaultPixeldrainStyle
		}
	}

	return selectedStyle
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

	Layer1Color  hsl // Deepest and darkest layer
	Layer1Shadow int // Deep layers have little shadow
	Layer2Color  hsl
	Layer2Shadow int
	Layer3Color  hsl
	Layer3Shadow int
	Layer4Color  hsl // Highest and brightest layer
	Layer4Shadow int // High layers have lots of shadow

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
	--layer_1_shadow:       %s;
	--layer_2_color:        #%s;
	--layer_2_color_border: #%s;
	--layer_2_shadow:       %s;
	--layer_3_color:        #%s;
	--layer_3_color_border: #%s;
	--layer_3_shadow:       %s;
	--layer_4_color:        #%s;
	--layer_4_color_border: #%s;
	--layer_4_shadow:       %s;

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
		fmt.Sprintf("%dpx", s.Layer1Shadow),
		s.Layer2Color.RGB(),
		s.Layer2Color.add(0, 0, .05).RGB(),
		fmt.Sprintf("%dpx", s.Layer2Shadow),
		s.Layer3Color.RGB(),
		s.Layer3Color.add(0, 0, .05).RGB(),
		fmt.Sprintf("%dpx", s.Layer3Shadow),
		s.Layer4Color.RGB(),
		s.Layer4Color.add(0, 0, .05).RGB(),
		fmt.Sprintf("%dpx", s.Layer4Shadow),
		s.ShadowColor.RGB(),
	)
}

type hsl struct {
	Hue        int
	Saturation float64
	Lightness  float64
}

func (h hsl) cssString() string {
	return fmt.Sprintf(
		"hsl(%d, %.3f%%, %.3f%%)",
		h.Hue,
		h.Saturation*100,
		h.Lightness*100,
	)
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
	InputColor:               hsl{0, 0, .2},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{89, .60, .45},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{339, .65, .31},
	ScrollbarForegroundColor: hsl{0, 0, .35},
	ScrollbarHoverColor:      hsl{0, 0, .45},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color:  hsl{0, 0, .08},
	Layer1Shadow: 3,
	Layer2Color:  hsl{0, 0, .11},
	Layer2Shadow: 5,
	Layer3Color:  hsl{0, 0, .15},
	Layer3Shadow: 7,
	Layer4Color:  hsl{0, 0, .18},
	Layer4Shadow: 9,

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

	Layer1Color:  hsl{0, 0, .98}, // hsl(0, 0%, 13%)
	Layer1Shadow: 3,
	Layer2Color:  hsl{0, 1, 1},
	Layer2Shadow: 5,
	Layer3Color:  hsl{0, 1, 1},
	Layer3Shadow: 6,

	ShadowColor: hsl{0, 0, 0},
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

	Layer1Color:  hsl{192, .87, .09},
	Layer1Shadow: 3,
	Layer2Color:  hsl{192, .81, .14},
	Layer2Shadow: 5,
	Layer3Color:  hsl{192, .95, .17},
	Layer3Shadow: 7,
	Layer4Color:  hsl{192, .99, .19},
	Layer4Shadow: 9,

	ShadowColor: hsl{0, 0, 0},
}

var maroonStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .7},
	InputColor:               hsl{0, .75, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{0, 1, .4},
	HighlightTextColor:       hsl{0, 0, 1},
	DangerColor:              hsl{0, .1, .1},
	ScrollbarForegroundColor: hsl{0, .75, .3},
	ScrollbarHoverColor:      hsl{0, .75, .4},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	Layer1Color:  hsl{0, .5, .05},
	Layer1Shadow: 3,
	Layer2Color:  hsl{0, .6, .08}, // hsl{0, .8, .15},
	Layer2Shadow: 5,
	Layer3Color:  hsl{0, .9, .14},
	Layer3Shadow: 7,
	Layer4Color:  hsl{0, .9, .20},
	Layer4Shadow: 9,

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

	Layer1Color:  hsl{0, 0, 0},
	Layer1Shadow: 3,
	Layer2Color:  hsl{0, 0, .03},
	Layer2Shadow: 5,
	Layer3Color:  hsl{120, .3, .08},
	Layer3Shadow: 7,
	Layer4Color:  hsl{120, .5, .12},
	Layer4Shadow: 9,

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

	Layer1Color:  hsl{180, .04, .16}, // hsl(180, 4%, 16%)
	Layer1Shadow: 3,
	Layer2Color:  hsl{170, .06, .21}, // hsl(170, 6%, 21%)
	Layer2Shadow: 5,
	Layer3Color:  hsl{172, .06, .25}, // hsl(172, 6%, 25%)
	Layer3Shadow: 6,
	Layer4Color:  hsl{172, .07, .30}, // hsl(172, 6%, 25%)
	Layer4Shadow: 7,

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

	Layer1Color:  hsl{215, .17, .19},
	Layer1Shadow: 3,
	Layer2Color:  hsl{227, .14, .25}, // hsl(227, 14%, 25%)
	Layer2Shadow: 5,
	Layer3Color:  hsl{223, .12, .29},
	Layer3Shadow: 7,
	Layer4Color:  hsl{223, .10, .32},
	Layer4Shadow: 9,

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

	Layer1Color:  hsl{160, .27, .05},
	Layer1Shadow: 3,
	Layer2Color:  hsl{163, .26, .09}, // hsl(163, 26%, 11%)
	Layer2Shadow: 5,
	Layer3Color:  hsl{161, .28, .12}, // hsl(161, 28%, 14%)
	Layer3Shadow: 7,
	Layer4Color:  hsl{161, .32, .15},
	Layer4Shadow: 9,

	ShadowColor: hsl{0, 0, 0},
}
