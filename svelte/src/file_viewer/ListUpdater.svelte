<script>
import { createEventDispatcher } from "svelte";
import UploadWidget from "../util/upload_widget/UploadWidget.svelte";

let dispatch = createEventDispatcher()

export let list = {
	title: "",
	files: [],
	info_href: "",
}

export const update = async new_files => {
	dispatch("loading", true)

	// If the list is empty we simply delete it
	if (list.files.length === 0) {
		try {
			let resp = await fetch(list.info_href, {method: "DELETE"})
			if (resp.status >= 400) {
				throw (await resp.json()).message
			}
			window.close()
		} catch (err) {
			alert("Failed to delete album: "+err)
		} finally {
			dispatch("loading", false)
		}
		return
	}

	let listjson = {
		title: list.title,
		files: [],
	}
	new_files.forEach(f => {
		listjson.files.push({
			id: f.id,
		})
	})

	try {
		const resp = await fetch(
			list.info_href,
			{ method: "PUT", body: JSON.stringify(listjson) },
			);
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}
	} catch (err) {
		alert("Failed to update album: "+err)
	} finally {
		dispatch("loading", false)
		dispatch("reload")
	}
}

let upload_widget
export const pick_files = () => upload_widget.pick_files()
export const upload_files = files => upload_widget.upload_files(files)

const uploads_finished = async (file_ids) => {
	let list_files = list.files;
	file_ids.forEach(id => {
		list_files.push({id: id})
	})

	await update(list_files)
}

const paste = (e) => {
	if (e.clipboardData.files.length !== 0) {
		e.preventDefault();
		e.stopPropagation();
		upload_widget.upload_files(e.clipboardData.files)
	}
}
</script>

<svelte:window on:paste={paste}/>

<UploadWidget bind:this={upload_widget} on:uploads_finished={e => uploads_finished(e.detail)}/>
