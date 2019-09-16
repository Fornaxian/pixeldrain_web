package webcontroller

import (
	"fmt"
	"html/template"
	"net/http"
)

func userStyle(r *http.Request) (style template.CSS) {
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
		case "default":
			fallthrough // use default case
		default:
			selectedStyle = defaultPixeldrainStyle
		}
	}

	return template.CSS(fmt.Sprintf(
		`:root {
	--text_color:                 %s;
	--input_color:                %s;
	--input_color_dark:           %s;
	--input_text_color:           %s;
	--highlight_color:            %s;
	--highlight_color_dark:       %s;
	--highlight_text_color:       %s;
	--danger_color:               %s;
	--danger_color_dark:          %s;
	--file_background_color:      %s;
	--scrollbar_foreground_color: %s;
	--scrollbar_background_color: %s;

	--background_color:           %s;
	--body_color:                 %s;

	--layer_1_color:  %s;
	--layer_1_shadow: %s;
	--layer_2_color:  %s;
	--layer_2_shadow: %s;
	--layer_3_color:  %s;
	--layer_3_shadow: %s;
	--layer_4_color:  %s;
	--layer_4_shadow: %s;

	--shadow_color:     %s;
	--shadow_spread:    %s;
	--shadow_intensity: %s;
}`,
		selectedStyle.TextColor.cssString(),
		selectedStyle.InputColor.cssString(),
		selectedStyle.InputColor.add(0, 0, -.03).cssString(),
		selectedStyle.InputTextColor.cssString(),
		selectedStyle.HighlightColor.cssString(),
		selectedStyle.HighlightColor.add(0, 0, -.03).cssString(),
		selectedStyle.HighlightTextColor.cssString(),
		selectedStyle.DangerColor.cssString(),
		selectedStyle.DangerColor.add(0, 0, -.03).cssString(),
		selectedStyle.FileBackgroundColor.cssString(),
		selectedStyle.ScrollbarForegroundColor.cssString(),
		selectedStyle.ScrollbarBackgroundColor.cssString(),
		selectedStyle.BackgroundColor.cssString(),
		selectedStyle.BodyColor.cssString(),
		selectedStyle.Layer1Color.cssString(),
		fmt.Sprintf("%dpx", selectedStyle.Layer1Shadow),
		selectedStyle.Layer2Color.cssString(),
		fmt.Sprintf("%dpx", selectedStyle.Layer2Shadow),
		selectedStyle.Layer3Color.cssString(),
		fmt.Sprintf("%dpx", selectedStyle.Layer3Shadow),
		selectedStyle.Layer4Color.cssString(),
		fmt.Sprintf("%dpx", selectedStyle.Layer4Shadow),
		selectedStyle.ShadowColor.cssString(),
		fmt.Sprintf("%dpx", selectedStyle.ShadowSpread),
		fmt.Sprintf("%dpx", selectedStyle.ShadowIntensity),
	))
}

type pixeldrainStyleSheet struct {
	TextColor                hsl
	InputColor               hsl // Buttons, text fields
	InputTextColor           hsl
	HighlightColor           hsl // Links, highlighted buttons, list navigation
	HighlightTextColor       hsl // Text on buttons
	DangerColor              hsl
	FileBackgroundColor      hsl
	ScrollbarForegroundColor hsl
	ScrollbarBackgroundColor hsl

	BackgroundColor hsl
	BodyColor       hsl

	Layer1Color  hsl // Deepest and darkest layer
	Layer1Shadow int // Deep layers have little shadow
	Layer2Color  hsl
	Layer2Shadow int
	Layer3Color  hsl
	Layer3Shadow int
	Layer4Color  hsl // Highest and brightest layer
	Layer4Shadow int // High layers have lots of shadow

	ShadowColor     hsl
	ShadowSpread    int // Pixels
	ShadowIntensity int // Pixels
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
	TextColor:                hsl{0, 0, .7},
	InputColor:               hsl{0, 0, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{89, .51, .45},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{339, .65, .31},
	FileBackgroundColor:      hsl{0, 0, .20},
	ScrollbarForegroundColor: hsl{0, 0, .35},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	BackgroundColor: hsl{0, 0, 0},
	BodyColor:       hsl{0, 0, .07},
	Layer1Color:     hsl{0, 0, .11},
	Layer1Shadow:    4,
	Layer2Color:     hsl{0, 0, .13},
	Layer2Shadow:    7,
	Layer3Color:     hsl{0, 0, .14},
	Layer3Shadow:    10,
	Layer4Color:     hsl{0, 0, .14},
	Layer4Shadow:    13,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}

var sunnyPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .1},
	InputColor:               hsl{0, 0, 1},
	InputTextColor:           hsl{0, 0, .1},
	HighlightColor:           hsl{89, .51, .5},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{339, .65, .31},
	FileBackgroundColor:      hsl{0, 0, 1},
	ScrollbarForegroundColor: hsl{0, 0, .30},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	BackgroundColor: hsl{0, 0, 0},
	BodyColor:       hsl{0, 0, 1},
	Layer1Color:     hsl{0, 0, 1},
	Layer1Shadow:    4,
	Layer2Color:     hsl{0, 0, 1},
	Layer2Shadow:    5,
	Layer3Color:     hsl{0, 0, 1},
	Layer3Shadow:    6,
	Layer4Color:     hsl{0, 0, 1},
	Layer4Shadow:    7,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}

var solarizedDarkStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .75},
	InputColor:               hsl{192, .95, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{145, .63, .42},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{343, .63, .42},
	FileBackgroundColor:      hsl{192, .87, .05},
	ScrollbarForegroundColor: hsl{192, .95, .30},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	BackgroundColor: hsl{192, 1, .05},
	BodyColor:       hsl{192, .81, .14}, // hsl(192, 81%, 14%)
	Layer1Color:     hsl{192, .87, .09},
	Layer1Shadow:    4,
	Layer2Color:     hsl{192, .81, .14},
	Layer2Shadow:    7,
	Layer3Color:     hsl{192, .95, .17},
	Layer3Shadow:    10,
	Layer4Color:     hsl{192, 1, .11}, // hsl(192, 100%, 11%)
	Layer4Shadow:    13,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}

var maroonStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .7},
	InputColor:               hsl{0, .75, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{0, 1, .4},
	HighlightTextColor:       hsl{0, 0, 1},
	DangerColor:              hsl{0, .1, .1},
	FileBackgroundColor:      hsl{0, 1, .03},
	ScrollbarForegroundColor: hsl{0, .75, .3},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	BackgroundColor: hsl{0, 1, .05},
	BodyColor:       hsl{0, .6, .1},
	Layer1Color:     hsl{0, .5, .07},
	Layer1Shadow:    4,
	Layer2Color:     hsl{0, .8, .15},
	Layer2Shadow:    7,
	Layer3Color:     hsl{0, .9, .2},
	Layer3Shadow:    10,
	Layer4Color:     hsl{0, .5, .07},
	Layer4Shadow:    13,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}

var hackerStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{0, 0, .25},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{120, 1, .5},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{0, .65, .31},
	FileBackgroundColor:      hsl{120, .8, .06},
	ScrollbarForegroundColor: hsl{120, .5, .25},
	ScrollbarBackgroundColor: hsl{0, 0, 0},

	BackgroundColor: hsl{0, 0, 0},
	BodyColor:       hsl{0, 0, 0},
	Layer1Color:     hsl{120, .1, .05},
	Layer1Shadow:    4,
	Layer2Color:     hsl{120, .2, .10},
	Layer2Shadow:    7,
	Layer3Color:     hsl{120, .3, .15},
	Layer3Shadow:    10,
	Layer4Color:     hsl{0, 0, .14},
	Layer4Shadow:    13,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}

var cantaPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, .8},
	InputColor:               hsl{167, .06, .40},
	InputTextColor:           hsl{0, 0, 1},
	HighlightColor:           hsl{165, 1, .40},
	HighlightTextColor:       hsl{0, 0, 0},
	DangerColor:              hsl{40, 1, .5},
	FileBackgroundColor:      hsl{170, .04, .29},
	ScrollbarForegroundColor: hsl{150, .02, .78},
	ScrollbarBackgroundColor: hsl{170, .05, .26},

	BackgroundColor: hsl{0, 0, 0},
	BodyColor:       hsl{172, .06, .25},
	Layer1Color:     hsl{170, .06, .21},
	Layer1Shadow:    4,
	Layer2Color:     hsl{160, .04, .31},
	Layer2Shadow:    7,
	Layer3Color:     hsl{170, .02, .47},
	Layer3Shadow:    10,
	Layer4Color:     hsl{172, .06, .25}, // hsl(172, 6%, 25%)
	Layer4Shadow:    13,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}

var arcPixeldrainStyle = pixeldrainStyleSheet{
	TextColor:                hsl{0, 0, 1},
	InputColor:               hsl{218, .16, .30},
	InputTextColor:           hsl{215, .19, .75},
	HighlightColor:           hsl{212, .71, .60},
	HighlightTextColor:       hsl{215, .19, .9},
	DangerColor:              hsl{357, .53, .57}, // hsl(357, 53%, 57%)
	FileBackgroundColor:      hsl{219, .1, .2},
	ScrollbarForegroundColor: hsl{222, .08, .44}, // hsl(222, 8%, 44%)
	ScrollbarBackgroundColor: hsl{223, .12, .2},  // hsl(223, 12%, 29%)

	BackgroundColor: hsl{0, 0, 0},
	BodyColor:       hsl{223, .12, .29},
	Layer1Color:     hsl{215, .17, .19},
	Layer1Shadow:    4,
	Layer2Color:     hsl{227, .14, .25}, // hsl(227, 14%, 25%)
	Layer2Shadow:    7,
	Layer3Color:     hsl{223, .12, .29},
	Layer3Shadow:    10,
	Layer4Color:     hsl{219, .15, .22}, // hsl(219, 15%, 22%)
	Layer4Shadow:    13,

	ShadowColor:     hsl{0, 0, 0},
	ShadowSpread:    10,
	ShadowIntensity: 0,
}
