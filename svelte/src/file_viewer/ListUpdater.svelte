<script lang="ts">
import UploadWidget from "util/upload_widget/UploadWidget.svelte";

let { list, on_loading, on_reload }: {
	list: any;
	on_loading: (loading: boolean) => void;
	on_reload: () => void;
} = $props();

export const update = async new_files => {
	on_loading(true)

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
			on_loading(false)
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
		on_loading(false)
		on_reload()
	}
}

let upload_widget: UploadWidget = $state()
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

<svelte:window onpaste={paste}/>

<UploadWidget bind:this={upload_widget} on_uploads_finished={uploads_finished}/>
