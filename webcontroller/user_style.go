package webcontroller

import (
	"bytes"
	"fmt"
	"html/template"
	"math/rand"
	"net/http"
	"time"
)

func userStyle(r *http.Request) (s pixeldrainStyleSheet) {
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
		s = pixeldrainClassicStyle
	case "solarized_dark":
		s = solarizedDarkStyle
	case "sunny":
		s = sunnyPixeldrainStyle
	case "maroon":
		s = maroonStyle
	case "hacker":
		s = hackerStyle
	case "canta":
		s = cantaPixeldrainStyle
	case "deepsea":
		s = deepseaPixeldrainStyle
	case "skeuos":
		s = skeuosPixeldrainStyle
	case "nord":
		s = nordPixeldrainStyle
	case "snowstorm":
		s = snowstormPixeldrainStyle
	case "default":
		fallthrough // use default case
	default:
		s = defaultPixeldrainStyle
	}

	// Set default colors
	var noColor = hsl{0, 0, 0}
	var setDefault = func(color *hsl, def hsl) {
		if *color == noColor {
			*color = def
		}
	}
	setDefault(&s.Link, s.Highlight.Add(0, 0, -.05))
	setDefault(&s.InputDisabled, s.Input.Add(0, -.2, -.2))
	setDefault(&s.ScrollbarForeground, s.Input)
	setDefault(&s.ScrollbarHover, s.ScrollbarForeground.Add(0, 0, .1))
	setDefault(&s.Layer1Text, s.Text)
	setDefault(&s.Chart1, s.Highlight)
	setDefault(&s.Chart2, s.Chart1.Add(120, 0, 0))
	setDefault(&s.Chart3, s.Chart2.Add(120, 0, 0))

	return s
}

type pixeldrainStyleSheet struct {
	Text                hsl
	Link                hsl // Based on Highlight if undefined
	Input               hsl // Buttons, text fields
	InputText           hsl
	InputDisabled       hsl
	Highlight           hsl // Links, highlighted buttons, list navigation
	HighlightText       hsl // Text on buttons
	Danger              hsl
	ScrollbarForeground hsl // Based on Highlight if undefined
	ScrollbarHover      hsl // Based on ScrollbarForeground if undefined

	Layer1     hsl // Deepest and darkest layer
	Layer1Text hsl // Based on Text if undefined
	Layer2     hsl
	Layer3     hsl
	Layer4     hsl // Highest and brightest layer

	// Colors to use in graphs
	Chart1 hsl
	Chart2 hsl
	Chart3 hsl

	Shadow hsl
	Light  bool // If this is a light theme
}

func (s pixeldrainStyleSheet) String() string {
	return fmt.Sprintf(
		`:root {
	--text_color:                 #%s;
	--link_color:                 #%s;
	--input_color:                #%s;
	--input_color_dark:           #%s;
	--input_text_color:           #%s;
	--input_disabled_color:       #%s;
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
	--layer_1_text_color:   #%s;
	--layer_2_color:        #%s;
	--layer_2_color_border: #%s;
	--layer_3_color:        #%s;
	--layer_3_color_border: #%s;
	--layer_4_color:        #%s;
	--layer_4_color_border: #%s;

	--chart_1_color: #%s;
	--chart_2_color: #%s;
	--chart_3_color: #%s;

	--shadow_color:     #%s;
}`,
		s.Text.RGB(),
		s.Link.RGB(),
		s.Input.RGB(),
		s.Input.Add(0, 0, -.02).RGB(),
		s.InputText.RGB(),
		s.InputDisabled.RGB(),
		s.Highlight.RGB(),
		s.Highlight.Add(0, 0, -.02).RGB(),
		s.HighlightText.RGB(),
		s.Danger.RGB(),
		s.Danger.Add(0, 0, -.02).RGB(),
		s.ScrollbarForeground.RGB(),
		s.ScrollbarHover.RGB(),
		s.Layer2.RGB(), // Scrollbar background
		s.Layer1.RGB(),
		s.Layer1.Add(0, 0, .05).RGB(),
		s.Layer1Text.RGB(),
		s.Layer2.RGB(),
		s.Layer2.Add(0, 0, .05).RGB(),
		s.Layer3.RGB(),
		s.Layer3.Add(0, 0, .05).RGB(),
		s.Layer4.RGB(),
		s.Layer4.Add(0, 0, .05).RGB(),
		s.Chart1.RGB(),
		s.Chart2.RGB(),
		s.Chart3.RGB(),
		s.Shadow.RGB(),
	)
}

func (s pixeldrainStyleSheet) Background(tpl *template.Template) template.URL {
	var (
		now   = time.Now()
		month = now.Month()
		day   = now.Day()
		file  string
	)

	if now.Weekday() == time.Wednesday && rand.Intn(20) == 0 {
		file = "checker_wednesday"
	} else if month == time.August && day == 8 {
		file = "checker_dwarf"
	} else if month == time.August && day == 24 {
		file = "checker_developers"
	} else if month == time.October && day == 31 {
		file = "checker_halloween"
	} else if month == time.December && (day == 25 || day == 26 || day == 27) {
		file = "checker_christmas"
	} else {
		file = fmt.Sprintf("checker%d", now.UnixNano()%18)
	}

	if s.Light {
		file += "_light"
	}

	var buf = bytes.Buffer{}
	if err := tpl.ExecuteTemplate(&buf, file+".png", nil); err != nil {
		panic(err)
	}
	return template.URL(buf.String())
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
func (h hsl) Add(hue int, saturation float64, lightness float64) hsl {
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
	Text:                hsl{0, 0, .8},
	Input:               hsl{266, .85, .38},
	InputText:           hsl{0, 0, 1},
	Highlight:           hsl{117, .63, .46},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{357, .63, .46},
	ScrollbarForeground: hsl{266, .85, .40},
	ScrollbarHover:      hsl{266, .85, .50},

	Layer1: hsl{275, .8, .07},
	Layer2: hsl{275, .75, .12},
	Layer3: hsl{275, .7, .18},
	Layer4: hsl{275, .65, .24},

	Shadow: hsl{0, 0, 0},
}

var pixeldrainClassicStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .8},
	Input:               hsl{0, 0, .25},
	InputText:           hsl{0, 0, 1},
	Highlight:           hsl{89, .60, .45},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{339, .65, .31},
	ScrollbarForeground: hsl{0, 0, .40},
	ScrollbarHover:      hsl{0, 0, .50},

	Layer1: hsl{0, 0, .08},
	Layer2: hsl{0, 0, .11},
	Layer3: hsl{0, 0, .15},
	Layer4: hsl{0, 0, .18},

	Shadow: hsl{0, 0, 0},
}

var sunnyPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .1},
	Input:               hsl{0, 0, .96}, // hsl(0, 0%, 96%)
	InputText:           hsl{0, 0, .1},
	Highlight:           hsl{89, .74, .5}, // hsl(89, 73%, 50%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{345, .99, .33}, // hsl(345, 99%, 33%)
	ScrollbarForeground: hsl{0, 0, .30},
	ScrollbarHover:      hsl{0, 0, .40},

	Layer1: hsl{0, 0, .98}, // hsl(0, 0%, 13%)
	Layer2: hsl{0, 1, 1},
	Layer3: hsl{0, 1, 1},
	Layer4: hsl{0, 1, 1},

	Shadow: hsl{0, 0, 0},
}

var solarizedDarkStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .75},
	Input:               hsl{192, .95, .25},
	InputText:           hsl{0, 0, 1},
	Highlight:           hsl{145, .63, .42},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{343, .63, .42},
	ScrollbarForeground: hsl{192, .95, .30},
	ScrollbarHover:      hsl{192, .95, .40},

	Layer1: hsl{192, .87, .09},
	Layer2: hsl{192, .81, .14},
	Layer3: hsl{192, .95, .17},
	Layer4: hsl{192, .99, .19},

	Shadow: hsl{0, 0, 0},
}

var maroonStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .8},
	Input:               hsl{0, .87, .40}, // hsl(0, 87%, 40%)
	InputText:           hsl{0, 0, 1},
	Highlight:           hsl{137, 1, .37}, //hsl(137, 100%, 37%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{9, .96, .42}, //hsl(9, 96%, 42%)
	ScrollbarForeground: hsl{0, .75, .3},
	ScrollbarHover:      hsl{0, .75, .4},

	Layer1: hsl{0, .7, .05},
	Layer2: hsl{0, .8, .08}, // hsl{0, .8, .15},
	Layer3: hsl{0, .9, .14},
	Layer4: hsl{0, .9, .20},

	Shadow: hsl{0, 0, 0},
}

var hackerStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .8},
	Input:               hsl{120, .5, .1}, // hsl(120, 50%, 10%)
	InputText:           hsl{0, 0, 1},
	Highlight:           hsl{120, 1, .5},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{0, 1, .4},
	ScrollbarForeground: hsl{120, .5, .25},
	ScrollbarHover:      hsl{120, .5, .35},

	Layer1: hsl{0, 0, 0},
	Layer2: hsl{0, 0, .03},
	Layer3: hsl{120, .3, .08},
	Layer4: hsl{120, .5, .12},

	Shadow: hsl{0, 0, 0},
}

var cantaPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .8},
	Input:               hsl{167, .06, .30}, // hsl(167, 6%, 30%)
	InputText:           hsl{0, 0, 1},
	Highlight:           hsl{165, 1, .40}, // hsl(165, 100%, 40%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{40, 1, .5},     // hsl(40, 100%, 50%)
	ScrollbarForeground: hsl{204, .05, .78}, // hsl(204, 5%, 78%)
	ScrollbarHover:      hsl{204, .05, .88},

	Layer1: hsl{180, .04, .16},
	Layer2: hsl{168, .05, .21},
	Layer3: hsl{170, .05, .26},
	Layer4: hsl{163, .04, .31},

	Shadow: hsl{0, 0, 0},
}

var deepseaPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .7},
	Input:               hsl{41, .58, .47},
	InputText:           hsl{0, 0, 0},
	Highlight:           hsl{5, .77, .55},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{5, .77, .55},
	ScrollbarForeground: hsl{162, .28, .23}, // hsl(162, 28%, 23%)
	ScrollbarHover:      hsl{12, .38, .26},  // hsl(12, 38%, 26%)

	Layer1: hsl{160, .27, .05},
	Layer2: hsl{163, .26, .09}, // hsl(163, 26%, 11%)
	Layer3: hsl{161, .28, .12}, // hsl(161, 28%, 14%)
	Layer4: hsl{161, .32, .15},

	Shadow: hsl{0, 0, 0},
}

var skeuosPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{60, .06, .93},  // hsl(60, 6%, 93%)
	Input:               hsl{226, .15, .23}, //hsl(226, 15%, 23%)
	InputText:           hsl{60, .06, .93},
	Highlight:           hsl{282, .65, .54}, // hsl(282, 65%, 54%)
	HighlightText:       hsl{0, 0, 1},
	Danger:              hsl{0, .79, .43},   // hsl(0, 79%, 43%)
	ScrollbarForeground: hsl{220, .02, .62}, // hsl(220, 2%, 62%)
	ScrollbarHover:      hsl{220, .02, .80},

	Layer1: hsl{232, .14, .11}, //hsl(232, 14%, 11%)
	Layer2: hsl{229, .14, .16}, // hsl(229, 14%, 16%)
	Layer3: hsl{225, .14, .17}, // hsl(225, 14%, 17%)
	Layer4: hsl{226, .14, .18}, // hsl(226, 14%, 18%)

	Shadow: hsl{0, 0, 0},
}

var nordPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{210, .34, .63},
	Input:               hsl{193, .43, .67},
	InputText:           hsl{180, .19, .23},
	Highlight:           hsl{145, .63, .42},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{354, .42, .56},
	ScrollbarForeground: hsl{193, .43, .67},
	ScrollbarHover:      hsl{193, .43, .76},

	Layer1: hsl{220, .16, .22},
	Layer2: hsl{222, .16, .28},
	Layer3: hsl{220, .17, .32},
	Layer4: hsl{220, .16, .36},

	Shadow: hsl{0, 0, 0},
}

var snowstormPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{220, .16, .36}, // hsl(220, 16%, 36%)
	Link:                hsl{92, .40, .40},
	Input:               hsl{193, .43, .67}, // hsl(193, 43%, 67%)
	InputText:           hsl{180, .19, .23},
	Highlight:           hsl{92, .28, .65}, // hsl(92, 28%, 65%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{354, .42, .56},
	ScrollbarForeground: hsl{193, .43, .67},
	ScrollbarHover:      hsl{193, .43, .76},

	Layer1:     hsl{220, .17, .32}, // hsl(220, 17%, 32%)
	Layer1Text: hsl{219, .28, .88},
	Layer2:     hsl{219, .28, .88}, // hsl(219, 28%, 88%)
	Layer3:     hsl{218, .27, .92}, // hsl(218, 27%, 92%)
	Layer4:     hsl{218, .27, .94}, // hsl(218, 27%, 94%)

	Shadow: hsl{0, .0, .70},
	Light:  true,
}
