<script>
import Button from "../../layout/Button.svelte";
import { fs_delete_all } from "../FilesystemAPI.mjs";
import PathLink from "../util/PathLink.svelte";

export let nav
export let file = {}
export let new_name
export let visible
export let open_after_edit

$: is_root_dir = file.path === "/"+file.id

const delete_file = async e => {
	e.preventDefault()

	try {
		nav.set_loading(true)
		await fs_delete_all(file.path)
	} catch (err) {
		console.error(err)
		alert(err)
		return
	} finally {
		nav.set_loading(false)
	}

	if (open_after_edit) {
		nav.navigate(file.path, false)
	} else {
		nav.reload()
	}
	visible = false
}
</script>

<fieldset>
	<legend>File settings</legend>
	{#if is_root_dir}
		<div class="highlight_yellow">
			Filesystem root cannot be renamed. If this shared directory
			is in
			<PathLink nav={nav} path="/me">your filesystem</PathLink>
			you can rename it from there
		</div>
	{/if}
	<div class="form_grid">
		<label for="file_name">Name</label>
		<input form="edit_form" bind:value={new_name} id="file_name" type="text" class="form_input" disabled={is_root_dir}/>
	</div>
</fieldset>

{#if $nav.permissions.delete === true}
	<fieldset>
		<legend>Delete</legend>
		<p>
			Delete this file or directory. If this is a directory then all
			subfiles will be deleted as well. This action cannot be undone.
		</p>
		<Button click={delete_file} red icon="delete" label="Delete" style="align-self: flex-start;"/>
	</fieldset>
{/if}

<style>
.form_grid {
	display: grid;
	grid-template-columns: 1fr 10fr;
	align-items: center;
}
</style>
