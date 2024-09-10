import parse from "pure-color/parse"
import rgb2hsl from "pure-color/convert/rgb2hsl";
import hsl2rgb from "pure-color/convert/hsl2rgb";
import rgb2hex from "pure-color/convert/rgb2hex";

// Generate a branding style from a file's properties map
export const branding_from_path = path => {
	let style = {}
	for (let node of path) {
		add_styles(style, node.properties)
	}
	last_generated_style = style
	return style
}

// The last style which was generated is cached, when we don't have a complete
// path to generate the style with we will use the cached style as a basis
let last_generated_style = {}
export const branding_from_node = node => {
	add_styles(last_generated_style, node.properties)
	return gen_css(last_generated_style)
}

export const css_from_path = path => {
	return gen_css(branding_from_path(path))
}

const gen_css = style => {
	return Object.entries(style).map(([key, value]) => `--${key}:${value}`).join(';');
}

// add_styles adds the styles configured in the properties struct to the
// existing style which is passed as the first argument. When navigating to a
// path this function is executed on every member of the path so all the styles
// get combined
const add_styles = (style, properties) => {
	if (!properties || !properties.branding_enabled || properties.branding_enabled !== "true") {
		return
	}

	if (properties.brand_input_color) {
		style.input_background = properties.brand_input_color
		style.input_hover_background = properties.brand_input_color
		style.input_text = add_contrast(properties.brand_input_color, 75)
	}
	if (properties.brand_highlight_color) {
		style.highlight_color = properties.brand_highlight_color
		style.highlight_background = properties.brand_highlight_color
		style.highlight_text_color = add_contrast(properties.brand_highlight_color, 75)

		// If we have a body colour to compare it to we use the highlight colour
		// to generate the link colour
		if (properties.brand_body_color) {
			style.link_color = generate_link_color(properties.brand_highlight_color, properties.brand_body_color)
		}
	}
	if (properties.brand_danger_color) {
		style.danger_color = properties.brand_danger_color
		style.danger_text_color = add_contrast(properties.brand_danger_color, 75)
	}
	if (properties.brand_background_color) {
		style.background_color = properties.brand_background_color
		style.background = properties.brand_background_color
		style.background_text_color = add_contrast(properties.brand_background_color, 75)
		style.background_pattern_color = properties.brand_background_color
	}
	if (properties.brand_body_color) {
		style.body_color = properties.brand_body_color
		style.body_background = properties.brand_body_color
		style.body_text_color = add_contrast(properties.brand_body_color, 75)
		style.shaded_background = set_alpha(properties.brand_body_color, 0.8)
		style.separator = add_contrast(properties.brand_body_color, 8)
		style.shadow_color = darken(properties.brand_body_color, 0.8)
	}
	if (properties.brand_card_color) {
		style.card_color = properties.brand_card_color
	}
	if (properties.brand_background_image) {
		style.background_image = "url('/api/filesystem/" + properties.brand_background_image + "')"
		style.background_image_size = "cover"
		style.background_image_position = "center"
		style.background_image_repeat = "no-repeat"
	}
}

const add_contrast = (color, amt) => {
	let hsl = rgb2hsl(parse(color)) // Convert hex to hsl
	// If the lightness is less than 40 it is considered a dark colour. This
	// threshold is 40 instead of 50 because overall dark text is more legible
	if (hsl[2] < 40) {
		hsl[2] = hsl[2] + amt // Dark color, add lightness
	} else {
		hsl[2] = hsl[2] - amt // Light color, remove lightness
	}
	return rgb2hex(hsl2rgb(hsl)) // Convert back to hex
}

// Darken and desaturate. Only used for shadows
const darken = (color, percent) => {
	let hsl = rgb2hsl(parse(color)) // Convert hex to hsl
	hsl[1] = hsl[1] * percent
	hsl[2] = hsl[2] * percent
	return rgb2hex(hsl2rgb(hsl)) // Convert back to hex
}

const set_alpha = (color, amt) => {
	let rgb = parse(color)
	rgb.push(amt)
	return "rgba(" + rgb.join(", ") + ")"
}

const generate_link_color = (link_color, body_color) => {
	let link = rgb2hsl(parse(link_color))
	let body = rgb2hsl(parse(body_color))

	// If the body and link colours are both dark we lighten the link, and the
	// other way around too
	if (body[2] < 50 && link[2] < 50) {
		link[2] = link[2] + 40 // Dark color, add lightness
	} else if (body[2] > 50 && link[2] > 50) {
		link[2] = link[2] - 40 // Light color, remove lightness
	}
	return rgb2hex(hsl2rgb(link)) // Convert back to hex
}
