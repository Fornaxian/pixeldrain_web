package webcontroller

import (
	"fmt"
)

type Color interface {
	CSS() string
}

// Raw CSS
type CSS string

func (c CSS) CSS() string { return string(c) }

const NoColor = CSS("none")

// HSL color
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
func (orig hsl) CSS() string {
	return "#" + orig.RGB()
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

func (h hsl) WithAlpha(alpha float64) HSLA {
	return HSLA{h, alpha}
}

type HSLA struct {
	hsl
	Alpha float64
}

func (hsla HSLA) CSS() string {
	return fmt.Sprintf(
		"hsla(%d, %.2f%%, %.2f%%, %.2f)",
		hsla.Hue, hsla.Saturation*100, hsla.Lightness*100, hsla.Alpha,
	)
}

type RGB struct {
	R uint8
	G uint8
	B uint8
}

func (rgb RGB) CSS() string {
	return fmt.Sprintf("#%02x%02x%02x", rgb.R, rgb.G, rgb.B)
}

type RGBA struct {
	R uint8
	G uint8
	B uint8
	A float64
}

func (rgba RGBA) CSS() string {
	return fmt.Sprintf("rgba(%d, %d, %d, %f)", rgba.R, rgba.G, rgba.B, rgba.A)
}

type Gradient struct {
	Angle  int
	Colors []Color
}

func NewGradient(angle int, colors ...Color) Gradient {
	return Gradient{angle, colors}
}

func (g Gradient) CSS() string {
	var colors string
	for i, color := range g.Colors {
		if i != 0 {
			colors += ", "
		}
		colors += color.CSS()
	}

	return fmt.Sprintf("linear-gradient(%ddeg, %s)", g.Angle, colors)
}
