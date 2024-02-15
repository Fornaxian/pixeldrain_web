<script>
import { fs_delete_all, fs_rename, fs_update } from "./FilesystemAPI";
import Modal from "../util/Modal.svelte";
import { createEventDispatcher } from "svelte";
import Button from "../layout/Button.svelte";
import BrandingOptions from "./BrandingOptions.svelte";

let dispatch = createEventDispatcher()

export let fs_navigator
let file = {
	path: "",
	name: "",
	id: "",
	mode_octal: "",
	properties: {},
};

export let visible
export const edit = (f, oae = false, t = "file") => {
	file = f
	open_after_edit = oae
	tab = t

	console.log("Editing file", file)

	file_name = file.name
	shared = !(file.id === undefined || file.id === "")

	if (file.properties === undefined) {
		file.properties = {}
	}
	branding_enabled = file.properties.branding_enabled === "true"
	visible = true
}

let tab = "file"
let open_after_edit = false

let file_name = ""
let shared = false

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
	"brand_footer_image",
	"brand_footer_link",
	"brand_background_image",
]

const save = async () => {
	console.debug("Saving file", file.path)

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

		await fs_update(file.path, opts)

		if (file_name !== file.name) {
			let parent = file.path.slice(0, -file.name.length)
			console.log("Moving", file.path, "to", parent+file_name)

			await fs_rename(file.path, parent+file_name)
			file.path = parent+file_name
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
}
const delete_file = async e => {
	e.preventDefault()

	try {
		dispatch("loading", true)
		await fs_delete_all(file.path)
	} catch (err) {
		console.error(err)
		alert(err)
		return
	} finally {
		dispatch("loading", false)
	}

	if (open_after_edit) {
		fs_navigator.navigate(file.path, false)
	} else {
		fs_navigator.reload()
	}
	visible = false
}
</script>

<Modal bind:visible={visible} title="Edit {file.name}" width="700px" form="file_edit_form">
	<div class="tab_bar">
		<button class:button_highlight={tab === "file"} on:click={() => tab = "file"}>
			<i class="icon">edit</i>
			Edit file
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

	<form id="file_edit_form" on:submit|preventDefault={save}></form>
	{#if tab === "file"}
		<div class="tab_content">
			<span class="header">File settings</span>
			<label for="file_name">Name:</label>
			<input form="file_edit_form" bind:value={file_name} id="file_name" type="text" class="form_input"/>
			<span class="header">Delete</span>
			<p>
				Delete this file or directory. If this is a directory then all
				subfiles will be deleted as well. This action cannot be undone.
			</p>
			<Button click={delete_file} red icon="delete" label="Delete" style="align-self: flex-start;"/>
		</div>
	{:else if tab === "share"}
		<div class="tab_content">
			<p>
				When a file or directory is shared it can be accessed
				through a unique link. You can get the URL with the 'Copy
				link' button on the toolbar, or share the link with the
				'Share' button. If you share a directory all the files
				within the directory are also accessible from the link.
			</p>
			<div>
				<input bind:checked={shared} id="shared" type="checkbox" class="form_input"/>
				<label for="shared">Share this file or directory</label>
			</div>
		</div>
	{:else if tab === "branding"}
		<div class="tab_content">
			<BrandingOptions bind:enabled={branding_enabled} bind:colors={branding_colors} file={file} on:style_change/>
		</div>
	{/if}
</Modal>

<style>
.header {
	margin-top: 1em;
	font-size: 1.5em;
	border-bottom: 1px var(--separator) solid;
}
.tab_bar {
	border-bottom: 2px solid var(--separator);
}
.tab_content {
	display: flex;
	flex-direction: column;
	padding: 8px;
}
</style>
