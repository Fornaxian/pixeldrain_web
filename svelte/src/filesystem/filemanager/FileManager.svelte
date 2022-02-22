<script>
import { fs_delete_node } from './../FilesystemAPI.svelte'
import { createEventDispatcher } from 'svelte'
import CreateDirectory from './CreateDirectory.svelte'
import FileUploader from './FileUploader.svelte'
import ListView from './ListView.svelte'
import GalleryView from './GalleryView.svelte'
let dispatch = createEventDispatcher()

export let state
export let directory_view = "gallery"
let uploader
let mode = "viewing"
let creating_dir = false

export const upload = files => {
	return uploader.upload(files)
}

const node_click = e => {
	let index = e.detail

	creating_dir = false

	// We prefix our custom state properties with fm_ to not interfere with
	// other modules
	if (mode === "viewing") {
		dispatch("navigate", state.children[index].path)
	} else if (mode === "selecting") {
		state.children[index].fm_selected = !state.children[index].fm_selected
	}
}
const navigate_up = () => {
	creating_dir = false

	// Go to the path of the last parent
	if (state.parents.length !== 0) {
		dispatch("navigate", state.parents[state.parents.length-1].path)
	}
}
const reload = () => { dispatch("navigate", state.base.path) }

const delete_selected = () => {
	if (mode !== "selecting") {
		return
	}

	let count = state.children.reduce((acc, cur) => {
		if (cur.fm_selected) {
			acc++
		}
		return acc
	}, 0)

	let confirmSingle = `Are you sure you want to delete this file? This action is irreversible.`
	let confirmMulti = `Are you sure you want to delete these ${count} files? This action is irreversible.`
	if (count === 0 ||
		(count === 1 && !confirm(confirmSingle)) ||
		(count > 1 && !confirm(confirmMulti))) {
		return
	}

	dispatch("loading", true)

	// Save all promises with deletion requests in an array
	let promises = []
	state.children.forEach(child => {
		if (!child.fm_selected) { return }
		promises.push(fs_delete_node(state.bucket.id, child.path))
	})

	// Wait for all the promises to finish
	Promise.all(promises).catch((err) => {
		console.error(err)
	}).finally(() => {
		mode = "viewing"
		reload()
	})
}
const toggle_select = () => {
	if (mode !== "selecting") {
		mode = "selecting"
		return
	}

	// Unmark all the selected files and return to viewing mode
	state.children.forEach((child, i) => {
		if (child.fm_selected) {
			state.children[i].fm_selected = false
		}
	})
	mode = "viewing"
}
</script>

<div class="container">
	<div class="width_container">
		<div class="toolbar">
			<button on:click={navigate_up} disabled={state.parents.length === 0}><i class="icon">arrow_back</i></button>
			<button on:click={reload}><i class="icon">refresh</i></button>
			{#if directory_view === "list"}
				<button on:click={() => {directory_view = "gallery"}} alt="Switch to gallery view">
					<i class="icon">collections</i>
				</button>
			{:else if directory_view === "gallery"}
				<button on:click={() => {directory_view = "list"}} alt="Switch to list view">
					<i class="icon">list</i>
				</button>
			{/if}

			<div class="toolbar_spacer"></div>
			{#if state.bucket.permissions.update}
				<button on:click={uploader.picker}><i class="icon">cloud_upload</i></button>
				<button on:click={() => {creating_dir = !creating_dir}} class:button_highlight={creating_dir}>
					<i class="icon">create_new_folder</i>
				</button>

				<button
					on:click={toggle_select}
					class:button_highlight={mode === "selecting"}>
					<i class="icon">edit</i>
				</button>
			{/if}
		</div>
		<br/>

		{#if mode === "selecting"}
			<div class="toolbar toolbar_edit highlight_green">
				<div style="flex: 1 1 auto; justify-self: center;">
					Select files or directories by clicking on them. Then you
					can choose which action to perform
				</div>
				<div style="display: flex; flex-direction: row; justify-content: center;">
					<button on:click={toggle_select}>
						<i class="icon">undo</i>
						Cancel
					</button>
					<button on:click={delete_selected} class="button_red">
						<i class="icon">delete</i>
						Delete selected
					</button>
				</div>
			</div>
			<br/>
		{/if}
		{#if creating_dir}
			<CreateDirectory state={state} on:done={() => {reload(); creating_dir = false;}} on:loading></CreateDirectory>
		{/if}

		<FileUploader
			bind:this={uploader}
			bucket_id={state.bucket.id}
			target_dir={state.base.path}
			on:reload={reload}
			write_password={state.write_password}
		></FileUploader>

	</div>

	{#if directory_view === "list"}
		<ListView state={state} on:node_click={node_click}></ListView>
	{:else if directory_view === "gallery"}
		<GalleryView state={state} on:node_click={node_click}></GalleryView>
	{/if}
</div>

<style>
.container {
	height: 100%;
	width: 100%;
	padding: 0;
	overflow-y: auto;
	text-align: center;
}
.width_container {
	position: relative;
	display: block;
	max-width: 95%;
	width: 1000px;
	margin: auto;
	padding: 0;
}
.toolbar {
	position: relative;
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	margin: 16px 0 0 0;
	padding: 0;
	justify-content: center;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }

@media(max-width: 800px) {
	.toolbar_edit {
		flex-direction: column;
	}
}
</style>
