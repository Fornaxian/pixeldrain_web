<script context="module">
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
	return gen_css(style)
}

// The last style which was generated is cached, when we don't have a complete
// path to generate the style with we will use the cached style as a basis
let last_generated_style = {}
export const branding_from_node = node => {
	add_styles(last_generated_style, node.properties)
	return gen_css(last_generated_style)
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
		style.input_text = add_light(properties.brand_input_color, 70)
		style.shadow_color = add_light(properties.brand_input_color, 20)
	}
	if (properties.brand_highlight_color) {
		style.highlight_color = properties.brand_highlight_color
		style.highlight_background = properties.brand_highlight_color
		style.highlight_text_color = add_light(properties.brand_highlight_color, 70)
		style.link_color = add_light(properties.brand_highlight_color, 10)
	}
	if (properties.brand_danger_color) {
		style.danger_color = properties.brand_danger_color
		style.danger_text_color = add_light(properties.brand_danger_color, 70)
	}
	if (properties.brand_background_color) {
		style.background_color = properties.brand_background_color
		style.background = properties.brand_background_color
		style.background_text_color = add_light(properties.brand_background_color, 70)
	}
	if (properties.brand_body_color) {
		style.body_color = properties.brand_body_color
		style.body_background = properties.brand_body_color
		style.body_text_color = add_light(properties.brand_body_color, 70)
		style.shaded_background = set_alpha(properties.brand_body_color, 0.8)
		style.separator = add_light(properties.brand_body_color, 5)
	}
	if (properties.brand_card_color) {
		style.card_color = properties.brand_card_color
	}
	if (properties.brand_background_image) {
		style.background_image = "url('/api/filesystem/"+properties.brand_background_image+"')"
		style.background_image_size = "cover"
		style.background_image_position = "center"
		style.background_image_repeat = "no-repeat"
	}
}

const add_light = (color, amt) => {
	let hsl = rgb2hsl(parse(color)) // Convert hex to hsl
	if (hsl[2] < 50) {
		hsl[2] = hsl[2]+amt // Dark color, add lightness
	} else {
		hsl[2] = hsl[2]-amt // Light color, remove lightness
	}
	return rgb2hex(hsl2rgb(hsl)) // Convert back to hex
}
const set_alpha = (color, amt) => {
	let rgb = parse(color)
	rgb.push(amt)
	return "rgba("+rgb.join(", ")+")"
}
</script>

<script>
import { createEventDispatcher } from "svelte";
import FilePicker from "./filemanager/FilePicker.svelte";
import { fs_update } from "./FilesystemAPI";
import { fs_node_type } from "./FilesystemUtil";

let dispatch = createEventDispatcher()

export let file = {
	properties: {
		branding_enabled: "false",
		brand_input_color: "#2d2d2d",
		brand_highlight_color: "#75b72d",
		brand_danger_color: "#bd5f69",
		brand_background_color: "#141414",
		brand_body_color: "#1e1e1e",
		brand_card_color: "#282828",
		brand_header_image: "",
		brand_header_link: "",
		brand_footer_image: "",
		brand_footer_link: "",
		brand_background_image: "",
	},
}

export let enabled = false

$: update_colors(file)
const update_colors = file => {
	if (enabled) {
		file.properties.branding_enabled = "true"
		dispatch("style_change", file)
	} else {
		file.properties.branding_enabled = ""
	}
}

let picker
let picking = ""
const pick_image = type => {
	picking = type
	picker.open(file.path)
}
const handle_picker = async e => {
	if (e.detail.length !== 1) {
		alert("Please select one file")
		return
	}
	let f = e.detail[0]
	let file_id = f.id

	if (fs_node_type(f) !== "image") {
		alert("Please select an image file")
		return
	}

	// If this image is not public, it will be made public
	if (file_id === undefined || file_id === "") {
		try {
			let new_file = await fs_update(e.detail[0].path, {shared: true})
			file_id = new_file.id
		} catch (err) {
			alert(err)
		}
	}

	if (picking === "brand_header_image") {
		file.properties.brand_header_image = file_id
	} else if (picking === "brand_background_image") {
		file.properties.brand_background_image = file_id
	}
}
</script>

<p>
	You can customize how your filesystem looks. The colours chosen here apply
	to the directory you're currently in and all files and directories in this
	directory. Colours which you do not want to modify can be left empty. Then
	the default theme colour will be used.
</p>

<div>
	<input bind:checked={enabled} id="enable_branding" type="checkbox" class="form_input"/>
	<label for="enable_branding">Enable custom branding options</label>
</div>
<hr/>

<div class="grid" class:disabled={!enabled}>
	<div>Button</div>
	<input type="color" bind:value={file.properties.brand_input_color}/>
	<input type="text" bind:value={file.properties.brand_input_color}/>
	<div>Highlighted button</div>
	<input type="color" bind:value={file.properties.brand_highlight_color}/>
	<input type="text" bind:value={file.properties.brand_highlight_color}/>
	<div>Danger button</div>
	<input type="color" bind:value={file.properties.brand_danger_color}/>
	<input type="text" bind:value={file.properties.brand_danger_color}/>
	<div>Background</div>
	<input type="color" bind:value={file.properties.brand_background_color}/>
	<input type="text" bind:value={file.properties.brand_background_color}/>
	<div>Body</div>
	<input type="color" bind:value={file.properties.brand_body_color}/>
	<input type="text" bind:value={file.properties.brand_body_color}/>
	<div>Card</div>
	<input type="color" bind:value={file.properties.brand_card_color}/>
	<input type="text" bind:value={file.properties.brand_card_color}/>
	<div class="span3">
		<hr/>

		You can choose an image to show above or behind the files in this
		directory. The image will be picked from your filesystem. If the image
		is not shared yet it will be made shared so it can be publicly
		downloaded.
	</div>
	<div>Header image ID</div>
	<button on:click={() => pick_image("brand_header_image")}>
		<i class="icon">folder_open</i>
		Pick
	</button>
	<input type="text" bind:value={file.properties.brand_header_image}/>
	<div>Header image link</div>
	<input class="span2" type="text" bind:value={file.properties.brand_header_link}/>
	<div>Background image ID</div>
	<button on:click={() => pick_image("brand_background_image")}>
		<i class="icon">folder_open</i>
		Pick
	</button>
	<input type="text" bind:value={file.properties.brand_background_image}/>
</div>

<hr/>
<p>
	Below is an example of what the site looks like with these colours:
</p>

<div class="example example_background">
	<div>The background</div>

	<div class="example example_body">
		<div>The content body. <a href="/">A link</a>!</div>

		<hr/>

		<div class="example_button_row">
			<button type="button"><i class="icon">touch_app</i>Normal</button>
			<button type="button" class="button_highlight"><i class="icon">priority_high</i>Important</button>
			<button type="button" class="button_red"><i class="icon">warning</i>Dangerous</button>
		</div>

		<div class="example_button_row">
			<input type="text" value="A text field"/>
		</div>

		<hr/>

		<div class="example example_card">
			<div>The top layer, for highlighted things</div>
		</div>
	</div>
</div>

<FilePicker bind:this={picker} on:files={handle_picker}/>

<style>
input[type="color"] {
	padding: 0;
	display: inline;
}
.grid {
	display: grid;
	width: 100%;
	grid-template-columns: auto auto auto;
	align-items: center;
}
.span2 {
	grid-column: span 2;
}
.span3 {
	grid-column: span 3;
}
.disabled {
	filter: brightness(50%);
}

.example {
	margin: 6px 0;
	padding: 10px;
	border-radius: 10px;
}
.example_background {
	background: var(--background);
	color: var(--background_text_color)
}
.example_body {
	background: var(--body_background);
	color: var(--body_text_color)
}
.example_button_row {
	display: flex;
	flex-direction: row;
}
.example_button_row>* {
	flex: 1 1 auto;
}
.example_card {
	background: var(--card_color);
}
</style>
