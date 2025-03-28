<script lang="ts">
import FilePicker from "file_viewer/FilePicker.svelte";
import { fs_import } from "filesystem/FilesystemAPI";
import type { FSNavigator } from "filesystem/FSNavigator";

export let nav: FSNavigator
let file_picker: FilePicker

export const open = () => file_picker.open()

// TODO: Give files a proper type
const import_files = async (files: any) => {
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
