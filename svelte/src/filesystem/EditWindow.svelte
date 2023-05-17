<script>
import { fs_delete_all, fs_rename, fs_update } from "./FilesystemAPI";
import Modal from "../util/Modal.svelte";

export let bucket = ""
export let navigator
let file = {
	path: "",
	name: "",
	id: "",
	mode_octal: "",
};

export let visible
export const edit = (f, t = "file") => {
	tab = t

	console.log("Editing file", f)
	file = f

	file_name = file.name
	shared = !(file.id === undefined || file.id === "")
	read_password = file.read_password ? file.read_password : ""
	write_password = file.write_password ? file.write_password : ""
	mode = file.mode_octal
	visible = true
}

let tab = "file"

let file_name = ""
let shared = false
let read_password = ""
let write_password = ""
let mode = ""

const save = async () => {
	console.debug("Saving file", file.path)
	try {
		await fs_update(
			bucket,
			file.path,
			{
				mode: mode,
				shared: shared,
				read_password: read_password,
				write_password: write_password,
			},
		)

		if (file_name !== file.name) {
			let parent = file.path.slice(0, -file.name.length)
			console.log("Moving", file.path, "to", parent+file_name)

			await fs_rename(bucket, file.path, parent+file_name)
			file.path = parent+file_name
		}
	} catch (err) {
		console.error(err)
		alert(err)
		return
	}

	navigator.navigate(file.path, false)
}
const delete_file = async () => {
	try {
		await fs_delete_all(bucket, file.path)
	} catch (err) {
		console.error(err)
		alert(err)
		return
	}

	navigator.navigate(file.path, false)
	visible = false
}
</script>

<Modal bind:visible={visible} title="Edit {file.name}" width="600px" on:save={save} form="file_edit_form">
	<div class="tab_bar">
		<button class:button_highlight={tab === "file"} on:click={() => tab = "file"}>
			<i class="icon">edit</i>
			Edit file
		</button>
		<button class:button_highlight={tab === "share"} on:click={() => tab = "share"}>
			<i class="icon">share</i>
			Sharing settings
		</button>
	</div>

	<form id="file_edit_form" on:submit|preventDefault={save} style="display: flex; padding: 8px;">
		{#if tab === "file"}
			<div class="form">
				<span class="header">File settings</span>
				<label for="file_name">Name:</label>
				<input bind:value={file_name} id="file_name" type="text" class="form_input"/>
				<label for="mode">Mode:</label>
				<input bind:value={mode} id="mode" type="text" class="form_input"/>
				<span class="header">Delete</span>
				<p>
					Delete this file or directory. If this is a directory then all
					subfiles will be deleted as well. This action cannot be undone.
				</p>
				<button on:click|preventDefault={delete_file} class="button_red" style="align-self: flex-start;">
					<i class="icon small">delete</i> Delete
				</button>
			</div>
		{:else if tab === "share"}
			<div class="form">
				<span class="header">
					Sharing settings
				</span>
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
				<label for="read_password">Read password:</label>
				<input bind:value={read_password} id="read_password" type="text" class="form_input"/>
				<label for="write_password">Write password:</label>
				<input bind:value={write_password} id="write_password" type="text" class="form_input"/>
			</div>
		{/if}
	</form>
</Modal>

<style>
.header {
	margin: 0.5em 0;
	font-size: 1.5em;
	border-bottom: 1px var(--separator) solid;
}
.tab_bar {
	border-bottom: 2px solid var(--separator);
}
</style>
