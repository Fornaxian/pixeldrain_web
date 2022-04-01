package webcontroller

import (
	"bytes"
	"fmt"
	"html/template"
	"math/rand"
	"net/http"
	"time"
)

func userStyleFromRequest(r *http.Request) (s template.CSS) {
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

func userStyle(style string) template.CSS {
	switch style {
	case "nord":
		return template.CSS(nordDarkStyle.withLight(nordLightStyle))
	case "nord_dark":
		return template.CSS(nordDarkStyle.String())
	case "nord_light", "snowstorm":
		return template.CSS(nordLightStyle.String())
	case "solarized":
		return template.CSS(solarizedDarkStyle.withLight(solarizedLightStyle))
	case "solarized_dark":
		return template.CSS(solarizedDarkStyle.String())
	case "solarized_light":
		return template.CSS(solarizedLightStyle.String())
	case "classic":
		return template.CSS(classicStyle.String())
	case "purple_drain":
		return template.CSS(defaultPixeldrainStyle.String())
	case "maroon":
		return template.CSS(maroonStyle.String())
	case "hacker":
		return template.CSS(hackerStyle.String())
	case "canta":
		return template.CSS(cantaPixeldrainStyle.String())
	case "skeuos":
		return template.CSS(skeuosPixeldrainStyle.String())
	case "sweet":
		return template.CSS(sweetPixeldrainStyle.String())
	case "adwaita":
		return template.CSS(adwaitaDarkStyle.withLight(adwaitaLightStyle))
	default:
		return template.CSS(nordDarkStyle.withLight(nordLightStyle))
	}
}

type styleSheet struct {
	Link                hsl // Based on Highlight if undefined
	Input               Color
	InputHover          Color
	InputText           Color
	InputDisabledText   Color
	HighlightBackground Color
	Highlight           hsl // Links, highlighted buttons, list navigation
	HighlightText       hsl // Text on buttons
	Danger              hsl
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
	CardColor         hsl
	CardText          hsl

	// Colors to use in graphs
	Chart1 hsl
	Chart2 hsl
	Chart3 hsl

	Shadow hsl
}

func (s styleSheet) withDefaults() styleSheet {
	// Set default colors
	var noColor = hsl{0, 0, 0}
	var defaultHSL = func(color *hsl, def hsl) {
		if *color == noColor {
			*color = def
		}
	}
	var defaultColor = func(color *Color, def Color) {
		if *color == nil {
			*color = def
		}
	}
	defaultHSL(&s.Link, s.Highlight.Add(0, 0, -.05))
	defaultColor(&s.ScrollbarForeground, s.Input)
	defaultColor(&s.ScrollbarHover, s.Highlight)
	defaultHSL(&s.Chart1, s.Highlight)
	defaultHSL(&s.Chart2, s.Chart1.Add(120, 0, 0))
	defaultHSL(&s.Chart3, s.Chart2.Add(120, 0, 0))
	defaultColor(&s.HighlightBackground, s.Highlight)
	defaultColor(&s.Background, s.BackgroundColor)
	defaultColor(&s.BackgroundPattern, s.BackgroundColor)
	defaultColor(&s.ParallaxSlider, s.BackgroundColor)
	defaultColor(&s.Navigation, NoColor)
	defaultColor(&s.BodyBackground, s.BodyColor)
	defaultHSL(&s.BackgroundText, s.BodyText)
	defaultColor(&s.Separator, s.BodyColor.Add(0, 0, .05))
	defaultColor(&s.Shaded, RGBA{0, 0, 0, 0.2})

	return s
}

func (s styleSheet) String() string {
	s = s.withDefaults()

	return fmt.Sprintf(
		`:root {
	--link_color:                 %s;
	--input_background:           %s;
	--input_hover_background:     %s;
	--input_text:                 %s;
	--input_disabled_text:        %s;
	--highlight_background:       %s;
	--highlight_color:            %s;
	--highlight_text_color:       %s;
	--danger_color:               %s;
	--danger_color_dark:          %s;
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
	--card_color:               %s;

	--chart_1_color: %s;
	--chart_2_color: %s;
	--chart_3_color: %s;

	--shadow_color: %s;
}`,
		s.Link.CSS(),
		s.Input.CSS(),
		s.InputHover.CSS(),
		s.InputText.CSS(),
		s.InputDisabledText.CSS(),
		s.HighlightBackground.CSS(),
		s.Highlight.CSS(),
		s.HighlightText.CSS(),
		s.Danger.CSS(),
		s.Danger.Add(0, 0, -.02).CSS(),
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
		s.CardColor.CSS(),
		s.Chart1.CSS(),
		s.Chart2.CSS(),
		s.Chart3.CSS(),
		s.Shadow.CSS(),
	)
}

func (dark styleSheet) withLight(light styleSheet) string {
	return fmt.Sprintf(
		`%s

@media (prefers-color-scheme: light) {
	%s
}`,
		dark.String(),
		light.String(),
	)
}

func BackgroundTiles(tpl *template.Template) template.URL {
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

var defaultPixeldrainStyle = styleSheet{
	Input:               hsl{266, .85, .24},
	InputHover:          hsl{266, .85, .28},
	InputText:           hsl{0, 0, .9},
	InputDisabledText:   hsl{266, .85, .4},
	HighlightBackground: NewGradient(150, hsl{150, .84, .39}, hsl{85, .85, .35}),
	Highlight:           hsl{117, .63, .46},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{357, .63, .46},
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
	CardColor:         hsl{275, .8, .18},

	Shadow: hsl{0, 0, 0},
}

var classicStyle = styleSheet{
	Input:               hsl{0, 0, .18},
	InputHover:          hsl{0, 0, .22},
	InputText:           hsl{0, 0, .9},
	InputDisabledText:   hsl{0, 0, .4},
	Highlight:           hsl{89, .60, .45},
	HighlightText:       hsl{0, 0, 0},
	Danger:              hsl{339, .65, .31},
	ScrollbarForeground: hsl{0, 0, .40},
	ScrollbarHover:      hsl{0, 0, .50},

	BackgroundColor: hsl{0, 0, .08},
	BodyColor:       hsl{0, 0, .12},
	BodyText:        hsl{0, 0, .8},
	CardColor:       hsl{0, 0, .16},

	Shadow: hsl{0, 0, 0},
}

var maroonStyle = styleSheet{
	Input:               hsl{0, .8, .20}, // hsl(0, 87%, 40%)
	InputHover:          hsl{0, .8, .24},
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
	CardColor:       hsl{0, .9, .14},

	Shadow: hsl{0, 0, 0},
}

var hackerStyle = styleSheet{
	Input:               hsl{0, 0, .1},
	InputHover:          hsl{0, 0, .14},
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
	CardColor:       hsl{120, .4, .05},

	Shadow: hsl{0, 0, 0},
}

var cantaPixeldrainStyle = styleSheet{
	Input:               hsl{167, .06, .30}, // hsl(167, 6%, 30%)
	InputHover:          hsl{167, .06, .34}, // hsl(167, 6%, 30%)
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
	CardColor:       hsl{170, .05, .26},

	Shadow: hsl{0, 0, 0},
}

var skeuosPixeldrainStyle = styleSheet{
	Input:               hsl{226, .15, .23}, //hsl(226, 15%, 23%)
	InputHover:          hsl{226, .15, .27},
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
	CardColor:       hsl{225, .14, .17}, // hsl(225, 14%, 17%)

	Shadow: hsl{0, 0, 0},
}

var nordDarkStyle = styleSheet{
	Input:               hsl{220, .16, .36}, // nord3
	InputHover:          hsl{220, .16, .40},
	InputText:           hsl{218, .27, .92}, // nord5 hsl(218, 27%, 92%)
	InputDisabledText:   hsl{220, .16, .22}, // nord0 hsl(220, 16%, 22%)
	Highlight:           hsl{92, .28, .65},  // nord14 hsl(92, 28%, 65%)
	HighlightText:       hsl{220, .16, .22}, // nord0
	Danger:              hsl{354, .42, .56}, // nord11 hsl(354, 42%, 56%)
	ScrollbarForeground: hsl{179, .25, .65}, // nord7 hsl(179, 25%, 65%)
	ScrollbarHover:      hsl{193, .43, .67}, // nord8 hsl(193, 43%, 67%)

	BackgroundColor: hsl{220, .16, .22}, // nord0
	BodyColor:       hsl{222, .16, .28}, // nord1
	BodyText:        hsl{219, .28, .88}, // nord4 hsl(219, 28%, 88%)
	CardColor:       hsl{220, .17, .32}, // nord2

	Shadow: hsl{0, 0, 0},
}

var nordLightStyle = styleSheet{
	Link:                hsl{92, .40, .32},
	Input:               hsl{218, .27, .94}, // nord6 hsl(218, 27%, 94%)
	InputHover:          hsl{218, .27, .98},
	InputText:           hsl{222, .16, .28}, // nord1 hsl(222, 16%, 28%)
	InputDisabledText:   hsl{219, .28, .88}, // nord4 hsl(219, 28%, 88%)
	Highlight:           hsl{92, .28, .65},  // nord14 hsl(92, 28%, 65%)
	HighlightText:       hsl{220, .16, .22}, // nord0
	Danger:              hsl{354, .42, .56}, // nord11 hsl(354, 42%, 56%)
	ScrollbarForeground: hsl{179, .25, .65}, // nord7 hsl(179, 25%, 65%)
	ScrollbarHover:      hsl{193, .43, .67}, // nord8 hsl(193, 43%, 67%)

	BackgroundColor:   hsl{220, .16, .36}, // nord3 hsl(220, 16%, 36%)
	BackgroundText:    hsl{219, .28, .88}, // nord4 hsl(219, 28%, 88%)
	ParallaxSlider:    hsl{220, .16, .22}, // nord0 hsl(220, 16%, 22%)
	BodyColor:         hsl{219, .28, .88}, // nord4 hsl(219, 28%, 88%)
	BodyText:          hsl{220, .17, .32}, // nord2 hsl(220, 17%, 32%)
	Shaded:            RGBA{255, 255, 255, 0.4},
	BackgroundPattern: hsl{219, .28, .88}, // hsl(219, 28%, 88%)
	CardColor:         hsl{218, .27, .92}, // nord5 hsl(218, 27%, 92%)

	Shadow: hsl{220, .16, .36},
}

var sweetPixeldrainStyle = styleSheet{
	Input:             hsl{229, .25, .18}, // hsl(229, 25%, 14%)
	InputHover:        hsl{229, .25, .22}, // hsl(229, 25%, 14%)
	InputText:         hsl{223, .13, .79},
	InputDisabledText: hsl{0, 0, .5},
	Highlight:         hsl{296, .88, .44},
	HighlightText:     hsl{0, 0, 0},
	Danger:            hsl{356, 1, .64}, // hsl(356, 100%, 64%)

	BackgroundColor: hsl{225, .25, .06}, // hsl(225, 25%, 6%)
	BodyColor:       hsl{228, .25, .12}, // hsl(228, 25%, 12%)
	BodyText:        hsl{223, .13, .79}, // hsl(223, 13%, 79%)
	Separator:       RGBA{255, 255, 255, 0.05},
	CardColor:       hsl{229, .25, .14}, // hsl(229, 25%, 14%)

	Shadow: hsl{0, 0, 0},
}

var adwaitaDarkStyle = styleSheet{
	Input:             RGBA{255, 255, 255, .06},
	InputHover:        RGBA{255, 255, 255, .1},
	InputText:         hsl{0, 0, 1},
	InputDisabledText: hsl{0, 0, .5},
	Highlight:         hsl{152, .62, .39}, // hsl(152, 62%, 39%)
	HighlightText:     hsl{0, 0, 0},
	Danger:            hsl{9, 1, .69}, // hsl(9, 100%, 69%)

	BackgroundColor: hsl{0, 0, .19},
	BodyColor:       hsl{0, 0, .14},
	BodyText:        hsl{0, 0, 1},
	Separator:       RGBA{255, 255, 255, 0.04},
	CardColor:       hsl{0, 0, .08},

	Shadow: hsl{0, 0, 0},
}

var adwaitaLightStyle = styleSheet{
	Input:             RGBA{0, 0, 0, .06},
	InputHover:        RGBA{0, 0, 0, .1},
	InputText:         hsl{0, 0, .2},
	InputDisabledText: hsl{0, 0, .7},
	Highlight:         hsl{152, .62, .47}, // hsl(152, 62%, 47%)
	HighlightText:     hsl{0, 0, 1},
	Danger:            hsl{356, .75, .43}, // hsl(356, 75%, 43%)

	BackgroundColor: hsl{0, 0, .92},
	BodyColor:       hsl{0, 0, .98},
	BodyText:        hsl{0, 0, .2},
	Shaded:          RGBA{0, 0, 0, 0.04},
	CardColor:       hsl{0, 0, 1},

	Shadow: hsl{0, 0, 0.36},
}

var solarizedDarkStyle = styleSheet{
	Input:             hsl{192, .81, .18}, // hsl(194, 14%, 40%)
	InputHover:        hsl{192, .81, .22}, // hsl(196, 13%, 45%)
	InputText:         hsl{180, .07, .80}, // hsl(44, 87%, 94%)
	InputDisabledText: hsl{194, .14, .30}, // hsl(194, 14%, 40%)
	Highlight:         hsl{68, 1, .30},    // hsl(68, 100%, 30%)
	HighlightText:     hsl{192, 1, .11},   // hsl(192, 100%, 11%)
	Danger:            hsl{1, .71, .52},   // hsl(1, 71%, 52%)

	BackgroundColor: hsl{192, 1, .11},   //hsl(192, 100%, 11%)
	BodyColor:       hsl{192, .81, .14}, // hsl(192, 81%, 14%)
	BodyText:        hsl{180, .07, .60}, // hsl(180, 7%, 60%)
	Separator:       RGBA{255, 255, 255, 0.05},
	CardColor:       hsl{192, .81, .16},

	Shadow: hsl{0, 0, 0},
}

var solarizedLightStyle = styleSheet{
	Input:             hsl{46, .42, .84}, //hsl(180, 7%, 60%)
	InputHover:        hsl{46, .42, .88},
	InputText:         hsl{194, .14, .20}, // hsl(192, 81%, 14%)
	InputDisabledText: hsl{194, .14, .80},
	Highlight:         hsl{68, 1, .30},  // hsl(68, 100%, 30%)
	HighlightText:     hsl{192, 1, .11}, // hsl(192, 100%, 11%)
	Danger:            hsl{1, .71, .52}, // hsl(1, 71%, 52%)

	BackgroundColor: hsl{46, .42, .88},  // hsl(46, 42%, 88%)
	BodyColor:       hsl{44, .87, .94},  // hsl(44, 87%, 94%)
	BodyText:        hsl{194, .14, .40}, // hsl(194, 14%, 40%)
	Separator:       RGBA{0, 0, 0, 0.05},
	Shaded:          RGBA{255, 255, 255, 0.2},
	CardColor:       hsl{44, .87, .96},

	Shadow: hsl{0, 0, 0.36},
}
