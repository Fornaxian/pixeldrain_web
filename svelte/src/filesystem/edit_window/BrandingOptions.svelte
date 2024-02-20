<script>
import { createEventDispatcher } from "svelte";
import FilePicker from "../filemanager/FilePicker.svelte";
import { fs_update } from "../FilesystemAPI";
import { fs_node_type } from "../FilesystemUtil";
import CustomBanner from "../viewers/CustomBanner.svelte";

let dispatch = createEventDispatcher()

export let file = {
	properties: {
		branding_enabled: "",
		brand_input_color: "",
		brand_highlight_color: "",
		brand_danger_color: "",
		brand_background_color: "",
		brand_body_color: "",
		brand_card_color: "",
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
		dispatch("style_change")
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
	<p class="span3">
		You can choose an image to show above or behind the files in this
		directory. The image will be picked from your filesystem. The image will
		get a shared file link. You can move and rename the file like normal,
		but if you remove the shared file property your branding will stop
		working. Recommended dimensions for the header image are 1000x90 px.
	</p>
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
		<div>Below is your custom header image, if you chose one.</div>
		<CustomBanner path={[file]}/>
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
	filter: opacity(40%);
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
