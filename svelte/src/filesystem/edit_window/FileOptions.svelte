<script>
import { createEventDispatcher } from "svelte";
import Button from "../../layout/Button.svelte";
import { fs_delete_all } from "../FilesystemAPI";
import PathLink from "../util/PathLink.svelte";

let dispatch = createEventDispatcher()
export let fs_navigator
export let file = {}
export let new_name
export let visible
export let open_after_edit

$: is_root_dir = file.path === "/"+file.id

const delete_file = async e => {
	e.preventDefault()

	try {
		dispatch("loading", true)
		await fs_delete_all(file.path)
	} catch (err) {
		console.error(err)
		alert(err)
		return
	} finally {
		dispatch("loading", false)
	}

	if (open_after_edit) {
		fs_navigator.navigate(file.path, false)
	} else {
		fs_navigator.reload()
	}
	visible = false
}

</script>

<h2>File settings</h2>
{#if is_root_dir}
	<div class="highlight_yellow">
		Filesystem root cannot be renamed. If this shared directory
		is in
		<PathLink nav={fs_navigator} path="/me">your filesystem</PathLink>
		you can rename it from there
	</div>
{/if}
<div class="form_grid">
	<label for="file_name">Name</label>
	<input form="edit_form" bind:value={new_name} id="file_name" type="text" class="form_input" disabled={is_root_dir}/>
</div>
<h2>Delete</h2>
<p>
	Delete this file or directory. If this is a directory then all
	subfiles will be deleted as well. This action cannot be undone.
</p>
<Button click={delete_file} red icon="delete" label="Delete" style="align-self: flex-start;"/>

<style>
.form_grid {
	display: grid;
	grid-template-columns: 1fr 10fr;
	align-items: center;
}
</style>
