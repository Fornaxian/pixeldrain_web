<script>
export let file = {
	id: "",
	name: "",
	get_href: "",
}

let file_name = ""
let result_success = false
let result_text = ""

$: update_file(file.id)
let update_file = () => {
	file_name = file.name
}

let rename_file = async e => {
	e.preventDefault()

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
	}
}

let delete_file = async e => {
	if (!confirm("Are you sure you want to delete '" + file.name + "'?")) {
		return
	}

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
	}
}

</script>

<div>
	{#if result_text !== ""}
		<div class:highlight_green={result_success} class:highligt_red={!result_success}>
			{result_text}
		</div>
	{/if}

	<h3>Rename</h3>
	<form on:submit={rename_file} style="display: flex; width: 100%">
		<input bind:value={file_name} type="text" style="flex: 1 1 auto"/>
		<button type="submit" style="flex: 0 0 auto">
			<i class="icon">save</i> Save
		</button>
	</form>
	<h3>Delete</h3>
	<p>
		When you delete a file it cannot be recovered.
		Nobody will be able to download it and the link will
		stop working. The file will also disappear from any
		lists it's contained in.
	</p>
	<div style="text-align: center;">
		<button on:click={delete_file} class="button_red">
			<i class="icon small">delete</i> Delete this file
		</button>
	</div>
</div>

<style>

</style>
