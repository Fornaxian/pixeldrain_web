<script>
import FilePicker from "file_viewer/FilePicker.svelte";
import { fs_import } from "filesystem/FilesystemAPI.mjs";

export let nav
let file_picker

export const open = () => file_picker.open()

const import_files = async files => {
	nav.set_loading(true)

	let fileids = []
	files.forEach(file => {
		fileids.push(file.id)
	})

	try {
		await fs_import(nav.base.path, fileids)
	} catch (err) {
		if (err.message) {
			alert(err.message)
		} else {
			console.error(err)
			alert(err)
		}
		return
	} finally {
		nav.reload()
	}
}
</script>

<FilePicker
	bind:this={file_picker}
	on:files={e => {import_files(e.detail)}}
	multi_select={true}
	title="Import files from file list">
</FilePicker>
