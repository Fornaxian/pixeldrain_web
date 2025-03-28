<script lang="ts">
import { createEventDispatcher } from "svelte";
import ThemePresets from "./ThemePresets.svelte";
import { fs_update, fs_node_type, type FSNode } from "filesystem/FilesystemAPI";
import CustomBanner from "filesystem/viewers/CustomBanner.svelte";
import HelpButton from "layout/HelpButton.svelte";
import FilePicker from "filesystem/filemanager/FilePicker.svelte";
let dispatch = createEventDispatcher()

export let file: FSNode
export let enabled = false

$: update_colors(file)
const update_colors = (file: FSNode) => {
	if (enabled) {
		file.properties.branding_enabled = "true"
		dispatch("style_change")
	} else {
		file.properties.branding_enabled = ""
	}
}

let picker: FilePicker
let picking = ""
const pick_image = (type: string) => {
	picking = type
	picker.open(file.path)
}
const handle_picker = async (e: CustomEvent<FSNode[]>) => {
	if (e.detail.length !== 1) {
		alert("Please select one file")
		return
	}
	let f = e.detail[0]
	let file_id = f.id

	if (fs_node_type(f) !== "image") {
		alert("Please select an image file")
		return
	} else if (f.file_size > 5e6) {
		alert("Please pick a file smaller than 5 MB. You can use WebP to achieve a better compression rate")
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

let highlight_info = false
</script>

<fieldset>
	<legend>Enable page branding</legend>
	<p>
		You can customize how your filesystem looks. The colours chosen here apply
		to the directory you're currently in and all files and directories in this
		directory. Colours which you do not want to modify can be left empty. Then
		the default theme colours will be used.
	</p>

	<div>
		<input bind:checked={enabled} id="enable_branding" type="checkbox" class="form_input"/>
		<label for="enable_branding">Enable custom page branding</label>
	</div>
</fieldset>

<fieldset disabled={!enabled} style="text-align: center;">
	<legend>Theme presets</legend>
	<ThemePresets bind:properties={file.properties}/>
</fieldset>

<fieldset class="grid" disabled={!enabled}>
	<legend>Custom colours</legend>
	<div>
		<div style="display: inline-block">Highlight</div>
		<HelpButton bind:toggle={highlight_info}/>
	</div>
	<input type="color" bind:value={file.properties.brand_highlight_color}/>
	<input type="text" bind:value={file.properties.brand_highlight_color}/>
	{#if highlight_info}
		<p class="span3">
			The highlight colour is used for highlighting selected buttons and
			other elements. It's also used as the page's theme colour, this
			affects things like the embed colour in Discord and the colour of
			the address bar in some web browsers.
		</p>
	{/if}
	<div>Button and input</div>
	<input type="color" bind:value={file.properties.brand_input_color}/>
	<input type="text" bind:value={file.properties.brand_input_color}/>
	<div>Delete button</div>
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
</fieldset>

<fieldset class="grid" disabled={!enabled}>
	<legend>Image customization</legend>
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
</fieldset>

<fieldset disabled={!enabled}>
	<legend>Page preview</legend>
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
</fieldset>

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
fieldset:disabled {
	filter: opacity(40%);
}

.example {
	margin: 6px 0;
	padding: 10px;
	border-radius: 10px;
}
.example_background {
	color: var(--background_text_color);
	background-image: var(--background_image);
	background-color: var(--background_pattern_color);
	background-size: var(--background_image_size, initial);
	background-position: var(--background_image_position, initial);
	background-repeat: var(--background_image_repeat, repeat);
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
