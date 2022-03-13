package webcontroller

import (
	"bytes"
	"fmt"
	"html/template"
	"math/rand"
	"net/http"
	"time"
)

func userStyleFromRequest(r *http.Request) (s pixeldrainStyleSheet) {
	// Get the chosen style from the URL
	var style = r.URL.Query().Get("style")

	// If the URL style was empty use the cookie value
	if style == "" {
		if cookie, err := r.Cookie("style"); err == nil {
			style = cookie.Value
		}
	}

	return userStyle(style)
}

func userStyle(style string) (s pixeldrainStyleSheet) {
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
	case "sweet":
		s = sweetPixeldrainStyle
	case "default":
		fallthrough // use default case
	default:
		s = defaultPixeldrainStyle
	}

	// Set default colors
	var noColor = hsl{0, 0, 0}
	var setDefaultHSL = func(color *hsl, def hsl) {
		if *color == noColor {
			*color = def
		}
	}
	var setDefaultColor = func(color *Color, def Color) {
		if *color == nil {
			*color = def
		}
	}
	setDefaultHSL(&s.Link, s.Highlight.Add(0, 0, -.05))
	setDefaultHSL(&s.InputDisabled, s.Input.Add(0, -.2, -.2))
	setDefaultHSL(&s.ScrollbarForeground, s.Input)
	setDefaultHSL(&s.ScrollbarHover, s.ScrollbarForeground.Add(0, 0, .1))
	setDefaultHSL(&s.Layer1Text, s.Text)
	setDefaultHSL(&s.Chart1, s.Highlight)
	setDefaultHSL(&s.Chart2, s.Chart1.Add(120, 0, 0))
	setDefaultHSL(&s.Chart3, s.Chart2.Add(120, 0, 0))
	setDefaultColor(&s.HighlightBackground, Gradient{180, []Color{s.Highlight, s.Highlight.Add(0, 0, -0.03)}})
	setDefaultColor(&s.Background, s.Layer1)
	setDefaultColor(&s.BackgroundPattern, s.Layer1)
	setDefaultColor(&s.ParallaxSlider, s.Layer1)
	setDefaultColor(&s.Navigation, NoColor)
	setDefaultColor(&s.Body, s.Layer2)

	return s
}

type pixeldrainStyleSheet struct {
	Text                hsl
	Link                hsl // Based on Highlight if undefined
	Input               hsl // Buttons, text fields
	InputText           hsl
	InputDisabled       hsl
	HighlightBackground Color
	Highlight           hsl // Links, highlighted buttons, list navigation
	HighlightText       hsl // Text on buttons
	Danger              hsl
	ScrollbarForeground hsl // Based on Highlight if undefined
	ScrollbarHover      hsl // Based on ScrollbarForeground if undefined

	Background        Color
	BackgroundPattern Color
	ParallaxSlider    Color
	Navigation        Color
	Body              Color
	Layer1            hsl // Deepest and darkest layer
	Layer1Text        hsl // Based on Text if undefined
	Layer2            hsl
	Layer3            hsl
	Layer4            hsl // Highest and brightest layer

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
	--text_color:                 %s;
	--link_color:                 %s;
	--input_color:                %s;
	--input_color_dark:           %s;
	--input_text_color:           %s;
	--input_disabled_color:       %s;
	--highlight_background:       %s;
	--highlight_color:            %s;
	--highlight_color_dark:       %s;
	--highlight_text_color:       %s;
	--danger_color:               %s;
	--danger_color_dark:          %s;
	--scrollbar_foreground_color: %s;
	--scrollbar_hover_color:      %s;
	--scrollbar_background_color: %s;

	--background:               %s;
	--background_pattern_color: %s;
	--parallax_slider_color:    %s;
	--navigation_background:    %s;
	--body_background:          %s;
	--layer_1_color:            %s;
	--layer_1_color_border:     %s;
	--layer_1_text_color:       %s;
	--layer_2_color:            %s;
	--layer_2_color_border:     %s;
	--layer_3_color:            %s;
	--layer_3_color_border:     %s;
	--layer_4_color:            %s;
	--layer_4_color_border:     %s;

	--chart_1_color: %s;
	--chart_2_color: %s;
	--chart_3_color: %s;

	--shadow_color: %s;
}`,
		s.Text.CSS(),
		s.Link.CSS(),
		s.Input.CSS(),
		s.Input.Add(0, 0, -.02).CSS(),
		s.InputText.CSS(),
		s.InputDisabled.CSS(),
		s.HighlightBackground.CSS(),
		s.Highlight.CSS(),
		s.Highlight.Add(0, 0, -.02).CSS(),
		s.HighlightText.CSS(),
		s.Danger.CSS(),
		s.Danger.Add(0, 0, -.02).CSS(),
		s.ScrollbarForeground.CSS(),
		s.ScrollbarHover.CSS(),
		s.Layer2.CSS(), // Scrollbar background
		s.Background.CSS(),
		s.BackgroundPattern.CSS(),
		s.ParallaxSlider.CSS(),
		s.Navigation.CSS(),
		s.Body.CSS(),
		s.Layer1.CSS(),
		s.Layer1.Add(0, 0, .05).CSS(),
		s.Layer1Text.CSS(),
		s.Layer2.CSS(),
		s.Layer2.Add(0, 0, .05).CSS(),
		s.Layer3.CSS(),
		s.Layer3.Add(0, 0, .05).CSS(),
		s.Layer4.CSS(),
		s.Layer4.Add(0, 0, .05).CSS(),
		s.Chart1.CSS(),
		s.Chart2.CSS(),
		s.Chart3.CSS(),
		s.Shadow.CSS(),
	)
}

func (s pixeldrainStyleSheet) BackgroundTiles(tpl *template.Template) template.URL {
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
		// file = "checker_ukraine"
		file = fmt.Sprintf("checker%d", now.UnixNano()%18)
	}

	var buf = bytes.Buffer{}
	if err := tpl.ExecuteTemplate(&buf, file+"_transparent.png", nil); err != nil {
		panic(err)
	}
	return template.URL(buf.String())
}

// Following are all the available styles

var defaultPixeldrainStyle = pixeldrainStyleSheet{
	Text:                hsl{0, 0, .8},
	Input:               hsl{266, .85, .38},
	InputText:           hsl{0, 0, 1},
	HighlightBackground: NewGradient(150, hsl{150, .84, .39}, hsl{85, .85, .35}),
	Highlight:           hsl{117, .63, .46},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{357, .63, .46},
	ScrollbarForeground: hsl{266, .85, .40},
	ScrollbarHover:      hsl{266, .85, .50},

	Background:        NewGradient(140, hsl{225, .9, .14}, hsl{274, .85, .16}, hsl{274, .85, .16}, hsl{310, .8, .12}),
	BackgroundPattern: NoColor,
	ParallaxSlider:    hsl{275, .8, .1},
	Navigation:        RGBA{0, 0, 0, 0.1},
	Body:              NoColor,
	Layer1:            hsl{275, .8, .07},
	Layer2:            hsl{275, .75, .12},
	Layer3:            hsl{275, .7, .18},
	Layer4:            hsl{275, .65, .24},

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

	ParallaxSlider:    hsl{220, .17, .20}, // Layer 1 but darker
	Layer1:            hsl{220, .17, .32}, // hsl(220, 17%, 32%)
	Layer1Text:        hsl{219, .28, .88},
	BackgroundPattern: hsl{219, .28, .88}, // hsl(219, 28%, 88%)
	Layer2:            hsl{219, .28, .88}, // hsl(219, 28%, 88%)
	Layer3:            hsl{218, .27, .92}, // hsl(218, 27%, 92%)
	Layer4:            hsl{218, .27, .94}, // hsl(218, 27%, 94%)

	Shadow: hsl{0, .0, .50},
	Light:  true,
}

var sweetPixeldrainStyle = pixeldrainStyleSheet{
	Text:          hsl{223, .13, .79}, // hsl(223, 13%, 79%)
	Input:         hsl{214, .26, .20}, // hsl(214, 26%, 12%)
	InputText:     hsl{223, .13, .79},
	Highlight:     hsl{296, .88, .44},
	HighlightText: hsl{0, 0, 0},
	Danger:        hsl{356, 1, .64}, // hsl(356, 100%, 64%)

	Layer1: hsl{225, .25, .06}, // hsl(225, 25%, 6%)
	Layer2: hsl{228, .25, .12}, // hsl(228, 25%, 12%)
	Layer3: hsl{229, .25, .14}, // hsl(229, 25%, 14%)
	Layer4: hsl{229, .25, .18},

	Shadow: hsl{0, 0, 0},
}
