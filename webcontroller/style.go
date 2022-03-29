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
	case "maroon":
		s = maroonStyle
	case "hacker":
		s = hackerStyle
	case "canta":
		s = cantaPixeldrainStyle
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
	setDefaultColor(&s.ScrollbarBackground, s.BodyColor)
	setDefaultColor(&s.ScrollbarForeground, s.Input)
	setDefaultColor(&s.ScrollbarHover, s.Highlight)
	setDefaultHSL(&s.Chart1, s.Highlight)
	setDefaultHSL(&s.Chart2, s.Chart1.Add(120, 0, 0))
	setDefaultHSL(&s.Chart3, s.Chart2.Add(120, 0, 0))
	setDefaultColor(&s.HighlightBackground, Gradient{180, []Color{s.Highlight, s.Highlight.Add(0, 0, -0.03)}})
	setDefaultColor(&s.Background, s.BackgroundColor)
	setDefaultColor(&s.BackgroundPattern, s.BackgroundColor)
	setDefaultColor(&s.ParallaxSlider, s.BackgroundColor)
	setDefaultColor(&s.Navigation, NoColor)
	setDefaultColor(&s.BodyBackground, s.BodyColor)
	setDefaultHSL(&s.BackgroundText, s.BodyText)
	setDefaultColor(&s.Separator, s.BodyColor.Add(0, 0, .05))
	setDefaultColor(&s.Shaded, RGBA{0, 0, 0, 0.2})

	return s
}

type pixeldrainStyleSheet struct {
	Link                hsl // Based on Highlight if undefined
	Input               Color
	InputText           Color
	InputDisabledText   Color
	HighlightBackground Color
	Highlight           hsl // Links, highlighted buttons, list navigation
	HighlightText       hsl // Text on buttons
	Danger              hsl
	ScrollbarBackground Color
	ScrollbarForeground Color // Based on Highlight if undefined
	ScrollbarHover      Color // Based on ScrollbarForeground if undefined

	BackgroundColor   hsl
	Background        Color
	BackgroundText    hsl
	BackgroundPattern Color
	ParallaxSlider    Color
	Navigation        Color
	BodyColor         hsl
	BodyBackground    Color
	BodyText          hsl
	Separator         Color
	Shaded            Color
	PopoutColor       hsl

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
	--link_color:                 %s;
	--input_background:           %s;
	--input_text:                 %s;
	--input_disabled_text:        %s;
	--highlight_background:       %s;
	--highlight_color:            %s;
	--highlight_text_color:       %s;
	--danger_color:               %s;
	--danger_color_dark:          %s;
	--scrollbar_background_color: %s;
	--scrollbar_foreground_color: %s;
	--scrollbar_hover_color:      %s;

	--background_color:         %s;
	--background:               %s;
	--background_text_color:    %s;
	--background_pattern_color: %s;
	--parallax_slider_color:    %s;
	--navigation_background:    %s;
	--body_color:               %s;
	--body_background:          %s;
	--body_text_color:          %s;
	--separator:                %s;
	--shaded_background:        %s;
	--popout_color:             %s;

	--chart_1_color: %s;
	--chart_2_color: %s;
	--chart_3_color: %s;

	--shadow_color: %s;
}`,
		s.Link.CSS(),
		s.Input.CSS(),
		s.InputText.CSS(),
		s.InputDisabledText.CSS(),
		s.HighlightBackground.CSS(),
		s.Highlight.CSS(),
		s.HighlightText.CSS(),
		s.Danger.CSS(),
		s.Danger.Add(0, 0, -.02).CSS(),
		s.ScrollbarBackground.CSS(),
		s.ScrollbarForeground.CSS(),
		s.ScrollbarHover.CSS(),
		s.BackgroundColor.CSS(),
		s.Background.CSS(),
		s.BackgroundText.CSS(),
		s.BackgroundPattern.CSS(),
		s.ParallaxSlider.CSS(),
		s.Navigation.CSS(),
		s.BodyColor.CSS(),
		s.BodyBackground.CSS(),
		s.BodyText.CSS(),
		s.Separator.CSS(),
		s.Shaded.CSS(),
		s.PopoutColor.CSS(),
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
	Input:               hsl{266, .85, .24},
	InputText:           hsl{0, 0, .9},
	InputDisabledText:   hsl{266, .85, .4},
	HighlightBackground: NewGradient(150, hsl{150, .84, .39}, hsl{85, .85, .35}),
	Highlight:           hsl{117, .63, .46},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{357, .63, .46},
	ScrollbarBackground: hsl{274, .9, .14},
	ScrollbarForeground: hsl{266, .85, .40},
	ScrollbarHover:      hsl{266, .85, .50},

	BackgroundColor:   hsl{275, .8, .10},
	Background:        NewGradient(120, hsl{250, .9, .14}, hsl{300, .9, .10}),
	BackgroundPattern: NoColor,
	ParallaxSlider:    hsl{275, .8, .1},
	Navigation:        RGBA{0, 0, 0, 0.1},
	BodyColor:         hsl{274, .9, .14},
	BodyBackground:    NoColor,
	BodyText:          hsl{0, 0, .8},
	PopoutColor:       hsl{275, .8, .18},

	Shadow: hsl{0, 0, 0},
}

var pixeldrainClassicStyle = pixeldrainStyleSheet{
	Input:               hsl{0, 0, .16},
	InputText:           hsl{0, 0, .9},
	InputDisabledText:   hsl{0, 0, .4},
	Highlight:           hsl{89, .60, .45},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{339, .65, .31},
	ScrollbarForeground: hsl{0, 0, .40},
	ScrollbarHover:      hsl{0, 0, .50},

	BackgroundColor: hsl{0, 0, .08},
	BodyColor:       hsl{0, 0, .11},
	BodyText:        hsl{0, 0, .8},
	PopoutColor:     hsl{0, 0, .18},

	Shadow: hsl{0, 0, 0},
}

var solarizedDarkStyle = pixeldrainStyleSheet{
	Input:               hsl{192, .95, .25},
	InputText:           hsl{0, 0, 1},
	InputDisabledText:   hsl{0, 0, .5},
	Highlight:           hsl{145, .63, .42},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{343, .63, .42},
	ScrollbarForeground: hsl{192, .95, .30},
	ScrollbarHover:      hsl{192, .95, .40},

	BackgroundColor: hsl{192, .87, .09},
	BodyColor:       hsl{192, .81, .14},
	BodyText:        hsl{0, 0, .75},
	PopoutColor:     hsl{192, .95, .17},

	Shadow: hsl{0, 0, 0},
}

var maroonStyle = pixeldrainStyleSheet{
	Input:               hsl{0, .8, .20}, // hsl(0, 87%, 40%)
	InputText:           hsl{0, 0, 1},
	InputDisabledText:   hsl{0, 0, .5},
	Highlight:           hsl{137, 1, .37}, //hsl(137, 100%, 37%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{9, .96, .42}, //hsl(9, 96%, 42%)
	ScrollbarForeground: hsl{0, .75, .3},
	ScrollbarHover:      hsl{0, .75, .4},

	BackgroundColor: hsl{0, .7, .05},
	BodyColor:       hsl{0, .8, .08}, // hsl{0, .8, .15},
	BodyText:        hsl{0, 0, .8},
	PopoutColor:     hsl{0, .9, .14},

	Shadow: hsl{0, 0, 0},
}

var hackerStyle = pixeldrainStyleSheet{
	Input:               hsl{0, 0, .1}, // hsl(120, 50%, 10%)
	InputText:           hsl{0, 0, 1},
	InputDisabledText:   hsl{0, 0, .5},
	Highlight:           hsl{120, .8, .5},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{0, 1, .4},
	ScrollbarForeground: hsl{120, .5, .25},
	ScrollbarHover:      hsl{120, .5, .35},

	BackgroundColor: hsl{0, 0, 0},
	BodyColor:       hsl{0, 0, .03},
	BodyText:        hsl{0, 0, .8},
	PopoutColor:     hsl{120, .4, .05},

	Shadow: hsl{0, 0, 0},
}

var cantaPixeldrainStyle = pixeldrainStyleSheet{
	Input:               hsl{167, .06, .30}, // hsl(167, 6%, 30%)
	InputText:           hsl{0, 0, 1},
	InputDisabledText:   hsl{0, 0, .5},
	Highlight:           hsl{165, 1, .40}, // hsl(165, 100%, 40%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{40, 1, .5},     // hsl(40, 100%, 50%)
	ScrollbarForeground: hsl{204, .05, .78}, // hsl(204, 5%, 78%)
	ScrollbarHover:      hsl{204, .05, .88},

	BackgroundColor: hsl{180, .04, .16},
	BodyColor:       hsl{168, .05, .21},
	BodyText:        hsl{0, 0, .8},
	PopoutColor:     hsl{170, .05, .26},

	Shadow: hsl{0, 0, 0},
}

var skeuosPixeldrainStyle = pixeldrainStyleSheet{
	Input:               hsl{226, .15, .23}, //hsl(226, 15%, 23%)
	InputText:           hsl{60, .06, .93},
	InputDisabledText:   hsl{0, 0, .5},
	Highlight:           hsl{282, .65, .54}, // hsl(282, 65%, 54%)
	HighlightText:       hsl{0, 0, 1},
	Danger:              hsl{0, .79, .43},   // hsl(0, 79%, 43%)
	ScrollbarForeground: hsl{220, .02, .62}, // hsl(220, 2%, 62%)
	ScrollbarHover:      hsl{220, .02, .80},

	BackgroundColor: hsl{232, .14, .11}, //hsl(232, 14%, 11%)
	BodyColor:       hsl{229, .14, .16}, // hsl(229, 14%, 16%)
	BodyText:        hsl{60, .06, .93},  // hsl(60, 6%, 93%)
	PopoutColor:     hsl{225, .14, .17}, // hsl(225, 14%, 17%)

	Shadow: hsl{0, 0, 0},
}

var nordPixeldrainStyle = pixeldrainStyleSheet{
	Input:               hsl{193, .43, .67},
	InputText:           hsl{180, .19, .23},
	InputDisabledText:   hsl{0, 0, .5},
	Highlight:           hsl{145, .63, .42},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{354, .42, .56},
	ScrollbarForeground: hsl{193, .43, .67},
	ScrollbarHover:      hsl{193, .43, .76},

	BackgroundColor: hsl{220, .16, .22},
	BodyColor:       hsl{222, .16, .28},
	BodyText:        hsl{210, .34, .63},
	PopoutColor:     hsl{220, .17, .32},

	Shadow: hsl{0, 0, 0},
}

var snowstormPixeldrainStyle = pixeldrainStyleSheet{
	Link:                hsl{92, .40, .40},
	Input:               hsl{219, .28, .88}, // hsl(219, 28%, 88%)
	InputText:           hsl{180, .19, .23},
	InputDisabledText:   hsl{180, .05, .63},
	Highlight:           hsl{179, .25, .65}, // hsl(92, 28%, 65%)
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{354, .42, .56},
	ScrollbarForeground: hsl{193, .43, .67},
	ScrollbarHover:      hsl{193, .43, .76},

	BackgroundColor:   hsl{220, .16, .36}, // hsl(220, 16%, 36%)
	BackgroundText:    hsl{219, .28, .88},
	ParallaxSlider:    hsl{220, .17, .20}, // Layer 1 but darker
	BodyColor:         hsl{218, .27, .94},
	BodyText:          hsl{220, .16, .36}, // hsl(220, 16%, 36%)
	Shaded:            RGBA{255, 255, 255, 0.4},
	BackgroundPattern: hsl{219, .28, .88}, // hsl(219, 28%, 88%)
	PopoutColor:       hsl{218, .27, .92}, // hsl(218, 27%, 92%)

	Shadow: hsl{220, .16, .36},
	Light:  true,
}

var sweetPixeldrainStyle = pixeldrainStyleSheet{
	Input:             hsl{229, .25, .18}, // hsl(229, 25%, 14%)
	InputText:         hsl{223, .13, .79},
	InputDisabledText: hsl{0, 0, .5},
	Highlight:         hsl{296, .88, .44},
	HighlightText:     hsl{0, 0, 0},
	Danger:            hsl{356, 1, .64}, // hsl(356, 100%, 64%)

	BackgroundColor: hsl{225, .25, .06}, // hsl(225, 25%, 6%)
	BodyColor:       hsl{228, .25, .12}, // hsl(228, 25%, 12%)
	BodyText:        hsl{223, .13, .79}, // hsl(223, 13%, 79%)
	PopoutColor:     hsl{229, .25, .14}, // hsl(229, 25%, 14%)

	Shadow: hsl{0, 0, 0},
}
