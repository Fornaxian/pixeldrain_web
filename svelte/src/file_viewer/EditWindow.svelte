<script lang="ts">
import Spinner from "util/Spinner.svelte"

let { file, list, on_reload }: {
	file: any;
	list: any;
	on_reload: () => void;
} = $props();

let loading = $state(false)
let result_success = $state(false)
let result_text = $state("")

// The inputs reset to the current names when another file or album is opened
let file_name = $derived(file.name)
let list_name = $derived(list.title)

let rename_file = async e => {
	e.preventDefault()
	loading = true

	const form = new FormData()
	form.append("action", "rename")
	form.append("name", file_name)

	try {
		const resp = await fetch(file.get_href, { method: "POST", body: form });
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}

		result_success = true
		result_text = "File name has been changed. Reload the page to see the changes"
	} catch (err) {
		result_success = false
		result_text = "Could not change file name: " + err
	} finally {
		loading = false
		on_reload()
	}
}

let delete_file = async e => {
	if (!confirm("Are you sure you want to delete '" + file.name + "'?")) {
		return
	}
	loading = true

	try {
		const resp = await fetch(file.get_href, { method: "DELETE" });
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}

		result_success = true
		result_text = "This file has been deleted, you can close the page"
	} catch (err) {
		result_success = false
		result_text = "Could not delete file: " + err
	} finally {
		loading = false
	}
}

let rename_list = async e => {
	e.preventDefault()
	loading = true

	let listjson = {
		title: list_name,
		files: [],
	}
	list.files.forEach(f => {
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

		result_success = true
		result_text = "Album name has been changed. Reload the page to see the changes"
	} catch (err) {
		result_success = false
		result_text = "Could not change album name: " + err
	} finally {
		loading = false
		on_reload()
	}
}

let delete_list = async e => {
	if (!confirm("Are you sure you want to delete '" + list.title + "'?")) {
		return
	}
	loading = true

	try {
		const resp = await fetch(list.info_href, { method: "DELETE" });
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}

		result_success = true
		result_text = "This album has been deleted, you can close the page"
	} catch (err) {
		result_success = false
		result_text = "Could not delete album: " + err
	} finally {
		loading = false
	}
}
</script>

<div class="indent">
	{#if loading}
		<div class="spinner_container">
			<Spinner></Spinner>
		</div>
	{/if}
	{#if result_text !== ""}
		<div class:highlight_green={result_success} class:highligt_red={!result_success}>
			{result_text}
		</div>
	{/if}

	{#if list.can_edit}
		<h3>Edit album</h3>
		Name:<br/>
		<form onsubmit={rename_list} style="display: flex;">
			<input bind:value={list_name} type="text" style="flex: 1 1 auto"/>
			<button type="submit" style="flex: 0 0 auto" class="button_highlight">
				<i class="icon">save</i> Save
			</button>
		</form>
		<h4>Delete</h4>
		<p>
			When you delete an album the files in the album will not be deleted,
			only the album itself.
		</p>
		<button onclick={delete_list} class="button_red">
			<i class="icon small">delete</i> Delete album
		</button>
	{/if}

	{#if file.can_edit}
		<h3>Edit file</h3>
		Name:<br/>
		<form onsubmit={rename_file} style="display: flex;">
			<input bind:value={file_name} type="text" style="flex: 1 1 auto"/>
			<button type="submit" style="flex: 0 0 auto" class="button_highlight">
				<i class="icon">save</i> Save
			</button>
		</form>
		<h4>Delete</h4>
		<p>
			When you delete a file it cannot be recovered.
			Nobody will be able to download it and the link will
			stop working. The file will also disappear from any
			lists it's contained in.
		</p>
		<button onclick={delete_file} class="button_red">
			<i class="icon small">delete</i> Delete file
		</button>
	{/if}
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
}
</style>
