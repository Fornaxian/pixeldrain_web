<script lang="ts">
import { fs_rename, fs_update, type FSNode, type NodeOptions } from "filesystem/FilesystemAPI";
import Modal from "util/Modal.svelte";
import BrandingOptions from "./BrandingOptions.svelte";
import { branding_from_node } from "./Branding";
import FileOptions from "./FileOptions.svelte";
import SharingOptions from "./SharingOptions.svelte";
import AccessControl from "./AccessControl.svelte";
import type { FSNavigator } from "filesystem/FSNavigator";

let file: FSNode = $state({} as FSNode)
let options: NodeOptions = $state({} as NodeOptions)

let { nav, visible = $bindable() }: {
	nav: FSNavigator;
	visible: boolean;
} = $props();

// Open the edit window. Argument 1 is the file to edit, 2 is whether the file
// should be opened after the user finishes editing and 3 is the default tab
// that should be open when the window shows
export const edit = (f: FSNode, oae = false, open_tab = "") => {
	file = f
	open_after_edit = oae
	if (open_tab !== "") {
		tab = open_tab
	}

	console.log("Editing file", $state.snapshot(file))

	// We save the name in a separate field because we need both the original
	// name and the new name for the rename operation
	new_name = file.name

	if (file.properties === undefined) {
		options = {} as NodeOptions
	} else {
		options = file.properties
	}

	options.custom_domain_name = file.custom_domain_name

	options.shared = !(file.id === undefined || file.id === "")
	if (options.shared) {
		if (file.link_permissions === undefined) {
			// Default to read-only for public links
			file.link_permissions = { owner: false, read: true, write: false, delete: false}
		} else {
			options.link_permissions = file.link_permissions
		}
		options.user_permissions = file.user_permissions
		options.password_permissions = file.password_permissions
	}

	branding_enabled = options.branding_enabled === "true"

	visible = true
}

let tab = $state("file")
let open_after_edit = $state(false)

let new_name = $state("")
let branding_enabled = $state(false)
let custom_css = $derived(branding_enabled ? branding_from_node(file) : "")

const save = async (keep_editing = false) => {
	console.debug("Saving file", file.path)

	let new_file: FSNode
	try {
		nav.set_loading(true)
		options.branding_enabled = JSON.stringify(branding_enabled)

		new_file = await fs_update(file.path, options)

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
		<button class:button_highlight={tab === "file"} onclick={() => tab = "file"}>
			<i class="icon">edit</i>
			Properties
		</button>
		<button class:button_highlight={tab === "share"} onclick={() => tab = "share"}>
			<i class="icon">share</i>
			Sharing
		</button>
		{#if options.shared && $nav.permissions.owner}
			<button class:button_highlight={tab === "access"} onclick={() => tab = "access"}>
				<i class="icon">key</i>
				Access control
			</button>
		{/if}
		<button class:button_highlight={tab === "branding"} onclick={() => tab = "branding"}>
			<i class="icon">palette</i>
			Branding
		</button>
	</div>

	<form id="edit_form" onsubmit={e => {e.preventDefault(); save(false)}}></form>

	<div class="tab_content">
		{#if tab === "file"}
			<FileOptions
				nav={nav}
				{file}
				bind:new_name
				bind:visible
				{open_after_edit}
			/>
		{:else if tab === "share"}
			<SharingOptions {file} bind:options on_save={() => save(true)} />
		{:else if tab === "access"}
			<AccessControl bind:options />
		{:else if tab === "branding"}
			<BrandingOptions
				bind:enabled={branding_enabled}
				bind:options={options}
				{file}
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
