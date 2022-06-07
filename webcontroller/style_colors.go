package webcontroller

import (
	"fmt"
	"math"
)

type Color interface {
	CSS
	HSL() HSL
	RGB() RGB
}

type CSS interface {
	CSS() string
}

// Raw CSS
type RawCSS string

func (c RawCSS) CSS() string { return string(c) }

// HSL color
type HSL struct {
	Hue        int
	Saturation float64
	Lightness  float64
}

var _ Color = HSL{} // Confirm interface compliance

func (hsl HSL) CSS() string { return hsl.RGB().CSS() }
func (hsl HSL) HSL() HSL    { return hsl }
func (hsl HSL) RGB() RGB {
	var r, g, b, q, p float64
	var h, s, l = float64(hsl.Hue) / 360, hsl.Saturation, hsl.Lightness

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
	return RGB{R: uint8(r * 255), G: uint8(g * 255), B: uint8(b * 255)}
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

func (hsl HSL) WithAlpha(alpha float64) HSLA {
	return HSLA{hsl.Hue, hsl.Saturation, hsl.Lightness, alpha}
}

type HSLA struct {
	Hue        int
	Saturation float64
	Lightness  float64
	Alpha      float64
}

var _ Color = HSLA{}

func (hsla HSLA) CSS() string {
	return fmt.Sprintf(
		"hsla(%d, %.2f%%, %.2f%%, %.2f)",
		hsla.Hue, hsla.Saturation*100, hsla.Lightness*100, hsla.Alpha,
	)
}
func (hsla HSLA) HSL() HSL { return HSL{hsla.Hue, hsla.Saturation, hsla.Lightness} }
func (hsla HSLA) RGB() RGB { return hsla.HSL().RGB() }

type RGB struct {
	R uint8
	G uint8
	B uint8
}

var _ Color = RGB{}

func (rgb RGB) CSS() string { return fmt.Sprintf("#%02x%02x%02x", rgb.R, rgb.G, rgb.B) }
func (rgb RGB) HSL() HSL {
	var r, g, b = float64(rgb.R), float64(rgb.G), float64(rgb.B)
	var h, s, l float64

	max := math.Max(math.Max(r, g), b)
	min := math.Min(math.Min(r, g), b)

	// Luminosity is the average of the max and min rgb color intensities.
	l = (max + min) / 2

	// saturation
	delta := max - min
	if delta == 0 {
		// it's gray
		return HSL{0, 0, l}
	}

	// it's not gray
	if l < 0.5 {
		s = delta / (max + min)
	} else {
		s = delta / (2 - max - min)
	}

	// hue
	r2 := (((max - r) / 6) + (delta / 2)) / delta
	g2 := (((max - g) / 6) + (delta / 2)) / delta
	b2 := (((max - b) / 6) + (delta / 2)) / delta
	switch {
	case r == max:
		h = b2 - g2
	case g == max:
		h = (1.0 / 3.0) + r2 - b2
	case b == max:
		h = (2.0 / 3.0) + g2 - r2
	}

	if h < 0 {
		h += 1
	} else if h > 1 {
		h -= 1
	}

	return HSL{int(h), s, l}
}
func (rgb RGB) RGB() RGB { return rgb }

type RGBA struct {
	R uint8
	G uint8
	B uint8
	A float64
}

var _ Color = RGBA{}

func (rgba RGBA) CSS() string {
	return fmt.Sprintf("rgba(%d, %d, %d, %f)", rgba.R, rgba.G, rgba.B, rgba.A)
}

func (rgba RGBA) HSL() HSL { return rgba.RGB().HSL() }
func (rgba RGBA) RGB() RGB { return RGB{rgba.R, rgba.G, rgba.B} }

type Gradient struct {
	Angle  int
	Colors []Color
}

var _ CSS = Gradient{}

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
