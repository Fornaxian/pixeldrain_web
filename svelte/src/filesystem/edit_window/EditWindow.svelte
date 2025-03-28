<script lang="ts">
import { fs_rename, fs_update, type FSNode, type FSNodeProperties, type NodeOptions } from "filesystem/FilesystemAPI";
import Modal from "util/Modal.svelte";
import BrandingOptions from "./BrandingOptions.svelte";
import { branding_from_node } from "./Branding";
import FileOptions from "./FileOptions.svelte";
import SharingOptions from "./SharingOptions.svelte";
import AccessControl from "./AccessControl.svelte";
import type { FSNavigator } from "filesystem/FSNavigator";

export let nav: FSNavigator
let file: FSNode = {} as FSNode

let custom_css = ""

export let visible: boolean

// Open the edit window. Argument 1 is the file to edit, 2 is whether the file
// should be opened after the user finishes editing and 3 is the default tab
// that should be open when the window shows
export const edit = (f: FSNode, oae = false, open_tab = "") => {
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
		file.properties = {} as FSNodeProperties
	}

	if (shared && file.link_permissions === undefined) {
		// Default to read-only for public links
		file.link_permissions = { owner: false, read: true, write: false, delete: false}
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

let new_name = ""
let shared = false
let branding_enabled = false

const save = async (keep_editing = false) => {
	console.debug("Saving file", file.path)

	let new_file: FSNode
	try {
		nav.set_loading(true)
		let opts = {
			shared: shared,
			branding_enabled: JSON.stringify(branding_enabled)
		} as NodeOptions

		if (branding_enabled && file.properties !== undefined) {
			for (let field of Object.keys(file.properties)) {
				console.log("setting", field, "to", file.properties[field])
				opts[field] = file.properties[field]
			}
		}

		if (shared) {
			opts.link_permissions = file.link_permissions
			opts.user_permissions = file.user_permissions
			opts.password_permissions = file.password_permissions
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
		nav.set_loading(false)
	}

	if (open_after_edit) {
		nav.navigate(file.path, false)
	} else {
		nav.reload()
	}

	if (keep_editing) {
		edit(new_file, open_after_edit)
	}
}
</script>

<Modal bind:visible={visible} title="Edit {file.name}" width="800px" form="edit_form" style="color: var(--body_text_color); {custom_css}">
	<div class="tab_bar">
		<button class:button_highlight={tab === "file"} on:click={() => tab = "file"}>
			<i class="icon">edit</i>
			Properties
		</button>
		<button class:button_highlight={tab === "share"} on:click={() => tab = "share"}>
			<i class="icon">share</i>
			Sharing
		</button>
		{#if shared && $nav.permissions.owner}
			<button class:button_highlight={tab === "access"} on:click={() => tab = "access"}>
				<i class="icon">key</i>
				Access control
			</button>
		{/if}
		<button class:button_highlight={tab === "branding"} on:click={() => tab = "branding"}>
			<i class="icon">palette</i>
			Branding
		</button>
	</div>

	<form id="edit_form" on:submit|preventDefault={() => save(false)}></form>

	<div class="tab_content">
		{#if tab === "file"}
			<FileOptions
				nav={nav}
				bind:file
				bind:new_name
				bind:visible
				bind:open_after_edit
			/>
		{:else if tab === "share"}
			<SharingOptions bind:file bind:shared on:save={() => save(true)} />
		{:else if tab === "access"}
			<AccessControl bind:file />
		{:else if tab === "branding"}
			<BrandingOptions
				bind:enabled={branding_enabled}
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
