<script>
import { onMount, createEventDispatcher } from "svelte";
import { fs_create_directory } from "../FilesystemAPI.svelte";
let dispatch = createEventDispatcher()

export let state;
let name_input;
let create_dir_name = ""
let create_dir = () => {
	dispatch("loading", true)

	let form = new FormData()
	form.append("type", "dir")

	fs_create_directory(
		state.bucket.id, state.base.path, create_dir_name,
	).then(resp => {
		create_dir_name = "" // Clear input field
	}).catch(err => {
		alert("Error: "+err)
	}).finally(() => {
		dispatch("done")
	})
}

onMount(() => { name_input.focus() })
</script>

<form class="node" on:submit|preventDefault={create_dir}>
	<td><img src="/res/img/mime/folder.png" class="node_icon" alt="icon"/></td>
	<td><input type="text" style="width: 100%;" bind:this={name_input} bind:value={create_dir_name} /></td>
	<td><input type="submit" value="create"/></td>
</form>
