<script>
import { fs_rename, fs_update } from "../FilesystemAPI";
import Modal from "../../util/Modal.svelte";
import { createEventDispatcher } from "svelte";
import BrandingOptions from "./BrandingOptions.svelte";
import { branding_from_node } from "./Branding";
import FileOptions from "./FileOptions.svelte";
import SharingOptions from "./SharingOptions.svelte";

let dispatch = createEventDispatcher()

export let fs_navigator
let file = {
	path: "",
	name: "",
	id: "",
	mode_octal: "",
	properties: {},
};

let custom_css = ""

export let visible

// Open the edit window. Argument 1 is the file to edit, 2 is whether the file
// should be opened after the user finishes editing and 3 is the default tab
// that should be open when the window shows
export const edit = (f, oae = false, open_tab = "") => {
	file = f
	open_after_edit = oae
	if (open_tab !== "") {
		tab = open_tab
	}

	console.log("Editing file", file)

	// We save the name in a separate field because we need both the original
	// name and the new name for the rename operation
	new_name = file.name
	shared = !(file.id === undefined || file.id === "")

	if (file.properties === undefined) {
		file.properties = {}
	}

	branding_enabled = file.properties.branding_enabled === "true"
	if (branding_enabled) {
		custom_css = branding_from_node(file)
	} else {
		custom_css = ""
	}

	visible = true
}

let tab = "file"
let open_after_edit = false

let shared = false
let new_name = ""

let branding_enabled = false
let branding_colors
let branding_fields = [
	"brand_input_color",
	"brand_highlight_color",
	"brand_danger_color",
	"brand_background_color",
	"brand_body_color",
	"brand_card_color",
	"brand_header_image",
	"brand_header_link",
	"brand_background_image",
]

const save = async (keep_editing = false) => {
	console.debug("Saving file", file.path)

	let new_file
	try {
		dispatch("loading", true)
		let opts = {shared: shared}

		opts.branding_enabled = branding_enabled ? "true" : ""

		if (branding_enabled && file.properties) {
			for (let field of branding_fields) {
				if (file.properties[field] !== undefined) {
					console.log("setting", field, "to", file.properties[field])
					opts[field] = file.properties[field]
				}
			}
		}

		new_file = await fs_update(file.path, opts)

		if (new_name !== file.name) {
			let parent = file.path.slice(0, -file.name.length)
			console.log("Moving", file.path, "to", parent+new_name)

			await fs_rename(file.path, parent+new_name)
			file.path = parent+new_name

			new_file.name = new_name
			new_file.path = file.path
		}
	} catch (err) {
		if (err.message) {
			alert(err.message)
		} else {
			console.error(err)
			alert(err)
		}
		return
	} finally {
		dispatch("loading", false)
	}

	if (open_after_edit) {
		fs_navigator.navigate(file.path, false)
	} else {
		fs_navigator.reload()
	}

	if (keep_editing) {
		edit(new_file, open_after_edit)
	}
}
</script>

<Modal bind:visible={visible} title="Edit {file.name}" width="700px" form="edit_form" style="color: var(--body_text_color); {custom_css}">
	<div class="tab_bar">
		<button class:button_highlight={tab === "file"} on:click={() => tab = "file"}>
			<i class="icon">edit</i>
			Properties
		</button>
		<button class:button_highlight={tab === "share"} on:click={() => tab = "share"}>
			<i class="icon">share</i>
			Sharing
		</button>
		<button class:button_highlight={tab === "branding"} on:click={() => tab = "branding"}>
			<i class="icon">palette</i>
			Branding
		</button>
	</div>

	<form id="edit_form" on:submit|preventDefault={() => save(false)}></form>

	<div class="tab_content">
		{#if tab === "file"}
			<FileOptions
				fs_navigator={fs_navigator}
				bind:file
				bind:new_name
				bind:visible
				bind:open_after_edit
				on:loading
			/>
		{:else if tab === "share"}
			<SharingOptions
				bind:file
				bind:shared
				on:save={() => save(true)}
			/>
		{:else if tab === "branding"}
			<BrandingOptions
				bind:enabled={branding_enabled}
				bind:colors={branding_colors}
				bind:file
				on:style_change={e => custom_css = branding_from_node(file)}
			/>
		{/if}
	</div>
</Modal>

<style>
.tab_bar {
	border-bottom: 2px solid var(--separator);
}
.tab_content {
	padding: 8px;
}
</style>
