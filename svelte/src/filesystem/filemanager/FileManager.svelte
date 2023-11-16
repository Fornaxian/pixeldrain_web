<script>
import { fs_delete_all, fs_rename } from './../FilesystemAPI.js'
import { createEventDispatcher, onMount } from 'svelte'
import CreateDirectory from './CreateDirectory.svelte'
import ListView from './ListView.svelte'
import GalleryView from './GalleryView.svelte'
import Button from '../../layout/Button.svelte';
let dispatch = createEventDispatcher()

export let fs_navigator
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
		fs_navigator.navigate(state.children[index].path, true)
	} else if (mode === "moving") {
		// If we are moving files we can only enter directories, and only if
		// they're not selected
		if (state.children[index].type === "dir" && !state.children[index].fm_selected) {
			fs_navigator.navigate(state.children[index].path, true)
		}
	} else if (mode === "selecting") {
		state.children[index].fm_selected = !state.children[index].fm_selected
	}
}
const node_share_click = e => {
	let index = e.detail

	creating_dir = false
	fs_navigator.navigate(state.children[index].id, true)
}
const node_select = e => {
	let index = e.detail
	mode = "selecting"
	state.children[index].fm_selected = !state.children[index].fm_selected
}

const node_settings = e => {
	edit_window.edit(state.children[e.detail], false)
}
const navigate_up = () => {
	creating_dir = false

	// Go to the path of the last parent
	if (state.path.length > 1) {
		fs_navigator.navigate(state.path[state.path.length-2].path, true)
	}
}
const navigate_back = () => {
	creating_dir = false
	history.back()
}

const delete_selected = async () => {
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

	try {
		// Save all promises with deletion requests in an array
		let promises = []
		state.children.forEach(child => {
			if (!child.fm_selected) { return }
			promises.push(fs_delete_all(child.path))
		})

		// Wait for all the promises to finish
		await Promise.all(promises)
	} catch (err) {
		console.log(err)
		alert("Delete failed: " + err.message + " ("+err.value+")")
	} finally {
		viewing_mode()
		fs_navigator.reload()
	}
}
const selecting_mode = () => {
	mode = "selecting"
}
const viewing_mode = () => {
	// Remove any items which we were moving
	moving_items = []

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

let moving_items = []

// When the directory is reloaded we want to keep our selection, so this
// function watches the children array for changes and updates the selection
// when it changes
$: update(state.children)
const update = (children) => {
	// Highlight the files which were previously selected
	for (let i = 0; i < children.length; i++) {
		for (let j = 0; j < moving_items.length; j++) {
			if (moving_items[j].path === children[i].path) {
				children[i].fm_selected = true
			}
		}
	}
}
const move_start = () => {
	moving_items = state.children.reduce((acc, child) => {
		if (child.fm_selected) {
			acc.push(child)
		}
		return acc
	}, [])
	mode = "moving"
}
const move_here = async () => {
	dispatch("loading", true)

	let target_dir = state.base.path + "/"

	try {
		// Save all promises with deletion requests in an array
		let promises = []
		moving_items.forEach(item => {
			console.log("moving", item.path, "to", target_dir + item.name)
			promises.push(fs_rename(item.path, target_dir + item.name))
		})

		// Wait for all the promises to finish
		await Promise.all(promises)
	} catch (err) {
		console.log(err)
		alert("Move failed: " + err.message + " ("+err.value+")")
	} finally {
		viewing_mode()
		fs_navigator.reload()
	}
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
		{#if mode === "viewing"}
			<div class="toolbar">
				<button on:click={navigate_back} title="Back">
					<i class="icon">arrow_back</i>
				</button>
				<button on:click={navigate_up} disabled={state.path.length <= 1} title="Up">
					<i class="icon">north</i>
				</button>
				<button on:click={fs_navigator.reload()} title="Refresh directory listing">
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
					<button on:click={() => dispatch("upload_picker")} title="Upload files to this directory">
						<i class="icon">cloud_upload</i>
					</button>
					<Button click={() => {creating_dir = !creating_dir}} highlight={creating_dir} icon="create_new_folder" title="Make folder"/>

					<button
						on:click={selecting_mode}
						class:button_highlight={mode === "selecting"}
						title="Select and delete files"
					>
						<i class="icon">edit</i>
					</button>
				{/if}
			</div>
		{:else if mode === "selecting"}
			<div class="toolbar toolbar_edit">
				<Button click={viewing_mode} icon="close"/>
				<div class="toolbar_spacer"></div>
				<Button click={move_start} icon="drive_file_move" label="Move"/>
				<button on:click={delete_selected} class="button_red">
					<i class="icon">delete</i>
					Delete
				</button>
			</div>
		{:else if mode === "moving"}
			<div class="toolbar toolbar_edit">
				<Button click={viewing_mode} icon="close"/>
				<Button click={navigate_up} disabled={state.path.length <= 1} icon="north"/>
				<div class="toolbar_spacer">
					Moving {moving_items.length} items
				</div>
				<Button click={() => {creating_dir = !creating_dir}} highlight={creating_dir} icon="create_new_folder" title="Make folder"/>
				<Button click={move_here} highlight icon="done" label="Move here"/>
			</div>
		{/if}

		{#if creating_dir}
			<CreateDirectory
				state={state}
				on:done={() => {fs_navigator.reload(); creating_dir = false;}}
				on:loading
			/>
		{/if}
	</div>

	{#if directory_view === "list"}
		<ListView
			state={state}
			show_hidden={show_hidden}
			on:node_click={node_click}
			on:node_share_click={node_share_click}
			on:node_settings={node_settings}
			on:node_select={node_select}
		/>
	{:else if directory_view === "gallery"}
		<GalleryView
			state={state}
			show_hidden={show_hidden}
			on:node_click={node_click}
			on:node_settings={node_settings}
			on:node_select={node_select}
		/>
	{/if}
</div>

<style>
.container {
	height: 100%;
	width: 100%;
	padding: 0;
	overflow: auto;
	display: block;
}
.width_container {
	position: sticky;
	top: 0;
	display: block;
	width: 100%;
	margin: auto;
	padding: 0;
	background: var(--shaded_background);
}
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	max-width: 1000px;
	margin: auto;
	padding: 0;
	justify-content: center;
	align-items: center;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer {
	flex: 1 1 auto;
	text-align: center;
}
.toolbar_edit {
	background-color: rgba(0, 255, 0, 0.05);
}
</style>
