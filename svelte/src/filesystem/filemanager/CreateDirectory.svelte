<script>
import { onMount, createEventDispatcher } from "svelte";
import { fs_mkdir } from "../FilesystemAPI.js";
let dispatch = createEventDispatcher()

export let state;
let name_input;
let new_dir_name = ""
let create_dir = () => {
	dispatch("loading", true)

	let form = new FormData()
	form.append("type", "dir")

	fs_mkdir(
		state.root.id, state.base.path+"/"+new_dir_name,
	).then(resp => {
		new_dir_name = "" // Clear input field
	}).catch(err => {
		if (err.value && err.value === "node_already_exists") {
			alert("A directory with this name already exists")
		} else {
			alert(err)
		}
	}).finally(() => {
		dispatch("done")
	})
}

onMount(() => { name_input.focus() })
</script>

<form class="create_dir highlight_shaded" on:submit|preventDefault={create_dir}>
	<img src="/res/img/mime/folder.png" class="icon" alt="icon"/>
	<input class="dirname" type="text" style="width: 100%;" bind:this={name_input} bind:value={new_dir_name} />
	<input class="submit" type="submit" value="create"/>
</form>

<style>
.create_dir {
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	max-width: 1000px;
}
.create_dir > img {
	height: 32px;
	width: 32px;
	flex: 0 0 auto;
}
.dirname {
	flex: 1 1 auto;
}
.submit {
	flex: 0 0 auto;
}
</style>
