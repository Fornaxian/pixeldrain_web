<script>
import { onMount, createEventDispatcher } from "svelte";
import { fs_mkdir } from "../FilesystemAPI.js";
import Button from "../../layout/Button.svelte";
let dispatch = createEventDispatcher()

export let state;
let name_input;
let new_dir_name = ""
let create_dir = () => {
	dispatch("loading", true)

	let form = new FormData()
	form.append("type", "dir")

	fs_mkdir(state.base.path+"/"+new_dir_name).then(resp => {
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

<form id="create_dir_form" class="create_dir" on:submit|preventDefault={create_dir}>
	<img src="/res/img/mime/folder.png" class="icon" alt="icon"/>
	<input class="dirname" type="text" bind:this={name_input} bind:value={new_dir_name} />
	<Button form="create_dir_form" type="submit" icon="create_new_folder" label="Create"/>
</form>

<style>
.create_dir {
	display: flex;
	flex-direction: row;
	width: 100%;
	max-width: 1000px;
	margin: auto;
}
.icon {
	align-self: center;
	height: 32px;
	width: 32px;
	flex: 0 0 auto;
}
.dirname {
	flex: 1 1 auto;
}
</style>
