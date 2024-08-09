<script>
import { onMount } from "svelte";
import { fs_mkdir } from "../FilesystemAPI.js";
import Button from "../../layout/Button.svelte";

export let nav;

let name_input;
let new_dir_name = ""
let error_msg = ""
let create_dir = async () => {
	let form = new FormData()
	form.append("type", "dir")

	try {
		nav.set_loading(true)
		await fs_mkdir(nav.base.path+"/"+new_dir_name)
		new_dir_name = "" // Clear input field
		error_msg = "" // Clear error msg
		nav.reload()
	} catch (err) {
		if (err.value && err.value === "node_already_exists") {
			error_msg = "A directory with this name already exists"
		} else {
			error_msg = "Server returned an error: "+err
		}
	} finally {
		nav.set_loading(false)
	}
}

onMount(() => {
	name_input.focus()
})
</script>

{#if error_msg !== ""}
	<div class="highlight_yellow create_dir">
		{error_msg}
	</div>
{/if}

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
