<script>
import { fs_rename, fs_update } from "./FilesystemAPI";
import Modal from "../util/Modal.svelte";
import { createEventDispatcher } from "svelte";

let dispatch = createEventDispatcher()

export let bucket = ""
let file = {
	path: "",
	name: "",
	id: "",
	mode_octal: "",
};

export let visible
export const edit = (f) => {
	console.log("Editing file", f)
	file = f

	file_name = file.name
	shared = !(file.id === undefined || file.id === "")
	read_password = file.read_password ? file.read_password : ""
	write_password = file.write_password ? file.write_password : ""
	mode = file.mode_octal
	visible = true
}

let file_name = ""
let shared = false
let read_password = ""
let write_password = ""
let mode = ""

const save = async () => {
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

	dispatch("navigate", {path: file.path, push_history: false})

	visible = false
}
</script>

<Modal bind:visible={visible} title="Edit" width="700px">
	<form on:submit|preventDefault={save} style="display: flex; padding: 8px;">
		<div class="form">
			<label for="file_name">Name:</label>
			<input bind:value={file_name} id="file_name" type="text" class="form_input"/>
			<label for="file_name">Shared:</label>
			<input bind:checked={shared} id="file_name" type="checkbox" class="form_input"/>
			<label for="read_password">Read password:</label>
			<input bind:value={read_password} id="read_password" type="text" class="form_input"/>
			<label for="write_password">Write password:</label>
			<input bind:value={write_password} id="write_password" type="text" class="form_input"/>
			<label for="mode">Mode:</label>
			<input bind:value={mode} id="mode" type="text" class="form_input"/>
			<button type="submit" style="flex: 0 0 auto" class="button_highlight">
				<i class="icon">save</i> Save
			</button>
		</div>
	</form>
</Modal>
