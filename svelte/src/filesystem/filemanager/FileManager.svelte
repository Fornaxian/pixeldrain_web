<script>
import { fs_delete } from './../FilesystemAPI.js'
import { createEventDispatcher, onMount } from 'svelte'
import CreateDirectory from './CreateDirectory.svelte'
import FileUploader from './FileUploader.svelte'
import ListView from './ListView.svelte'
import GalleryView from './GalleryView.svelte'
let dispatch = createEventDispatcher()

export let navigator
export let state
export let edit_window
export let directory_view = ""
let uploader
let mode = "viewing"
let creating_dir = false
let show_hidden = false

export const upload = files => {
	return uploader.upload(files)
}

const node_click = e => {
	let index = e.detail

	creating_dir = false

	// We prefix our custom state properties with fm_ to not interfere with
	// other modules
	if (mode === "viewing") {
		navigator.navigate(state.children[index].path, true)
	} else if (mode === "selecting") {
		state.children[index].fm_selected = !state.children[index].fm_selected
	}
}

const node_settings = e => {
	edit_window.edit(state.children[e.detail])
}
const navigate_up = () => {
	creating_dir = false

	// Go to the path of the last parent
	if (state.path.length > 1) {
		navigator.navigate(state.path[state.path.length-2].path, true)
	}
}
const reload = () => { navigator.navigate(state.base.path) }

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
		promises.push(fs_delete(state.root.id, child.path))
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

const toggle_view = () => {
	if (directory_view === "list") {
		directory_view = "gallery"
	} else {
		directory_view = "list"
	}

	localStorage.setItem("directory_view", directory_view)
}
onMount(() => {
	if(typeof Storage !== "undefined") {
		directory_view = localStorage.getItem("directory_view")
	}
	if (directory_view === "" || directory_view === null) {
		directory_view = "list"
	}
})
</script>

<div class="container">
	<div class="width_container">
		<div class="toolbar">
			<button on:click={navigate_up} disabled={state.path.length <= 1} title="Back">
				<i class="icon">arrow_back</i>
			</button>
			<button on:click={reload} title="Refresh directory listing">
				<i class="icon">refresh</i>
			</button>
				<button on:click={() => toggle_view()} title="Switch between gallery view and list view">
					{#if directory_view === "list"}
						<i class="icon">collections</i>
					{:else if directory_view === "gallery"}
						<i class="icon">list</i>
					{/if}
				</button>

			<button on:click={() => {show_hidden = !show_hidden}} title="Toggle hidden files">
				{#if show_hidden}
					<i class="icon">visibility_off</i>
				{:else}
					<i class="icon">visibility</i>
				{/if}
			</button>

			<div class="toolbar_spacer"></div>
			{#if state.permissions.update}
				<button on:click={uploader.picker} title="Upload files to this directory">
					<i class="icon">cloud_upload</i>
				</button>
				<button on:click={() => {creating_dir = !creating_dir}} class:button_highlight={creating_dir} title="Make folder">
					<i class="icon">create_new_folder</i>
				</button>

				<button
					on:click={toggle_select}
					class:button_highlight={mode === "selecting"}
					title="Select and delete files"
				>
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
			bucket_id={state.root.id}
			target_dir={state.base.path}
			on:reload={reload}
			write_password={state.write_password}
		></FileUploader>

	</div>

	{#if directory_view === "list"}
		<ListView state={state} show_hidden={show_hidden} on:node_click={node_click} on:node_settings={node_settings}></ListView>
	{:else if directory_view === "gallery"}
		<GalleryView state={state} show_hidden={show_hidden} on:node_click={node_click} on:node_settings={node_settings}></GalleryView>
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
	width: 100%;
	margin: auto;
	padding: 0;
	background: var(--shaded_background);
}
.toolbar {
	position: relative;
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	max-width: 1000px;
	margin: 0;
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
