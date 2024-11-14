<script>
import { fs_delete_all, fs_rename } from './../FilesystemAPI.ts'
import { onMount } from 'svelte'
import CreateDirectory from './CreateDirectory.svelte'
import ListView from './ListView.svelte'
import GalleryView from './GalleryView.svelte'
import Button from '../../layout/Button.svelte';
import FileImporter from './FileImporter.svelte';
import { formatDate } from '../../util/Formatting.svelte';
import { drop_target } from "../../lib/DropTarget.ts"
import SearchBar from './SearchBar.svelte';

export let nav
export let upload_widget
export let edit_window
export let directory_view = ""
let large_icons = false
let uploader
let mode = "viewing"
let creating_dir = false
let show_hidden = false
let file_importer

export const upload = files => {
	return uploader.upload(files)
}

// Navigation functions

const node_click = e => {
	let index = e.detail

	creating_dir = false

	// We prefix our custom state properties with fm_ to not interfere with
	// other modules
	if (mode === "viewing") {
		nav.navigate(nav.children[index].path, true)
	} else if (mode === "moving") {
		// If we are moving files we can only enter directories, and only if
		// they're not selected. That last requirement prevents people from
		// moving a directory into itself
		if (nav.children[index].type === "dir" && !nav.children[index].fm_selected) {
			nav.navigate(nav.children[index].path, true)
		}
	} else if (mode === "selecting") {
		select_node(index)
	}
}
let node_context = e => {
	// If this is a touch event we will select the item
	if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
		e.detail.event.preventDefault()
		node_select({detail: e.detail.index})
	}
}
const node_share_click = e => {
	let index = e.detail

	creating_dir = false
	nav.navigate(nav.children[index].id, true)
}
const node_select = e => {
	let index = e.detail
	mode = "selecting"
	nav.children[index].fm_selected = !nav.children[index].fm_selected
}

const node_settings = e => edit_window.edit(nav.children[e.detail], false, "file")
const node_branding = e => edit_window.edit(nav.children[e.detail], false, "branding")

const navigate_back = () => {
	creating_dir = false
	history.back()
}

// Deletion function

const delete_selected = async () => {
	let count = nav.children.reduce((acc, cur) => {
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

	nav.set_loading(true)

	try {
		// Save all promises with deletion requests in an array
		let promises = []
		nav.children.forEach(child => {
			if (!child.fm_selected) {
				return
			}
			promises.push(fs_delete_all(child.path))
		})

		// Wait for all the promises to finish
		await Promise.all(promises)
	} catch (err) {
		console.log(err)
		alert("Delete failed: " + err.message + " ("+err.value+")")
	} finally {
		viewing_mode()
		nav.reload()
	}
}

// Mode switches

const selecting_mode = () => {
	mode = "selecting"
}
const viewing_mode = () => {
	// Remove any items which we were moving
	moving_items = []

	// Unmark all the selected files and return to viewing mode
	nav.children.forEach((child, i) => {
	if (child.fm_selected) {
		nav.children[i].fm_selected = false
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
const toggle_large_icons = () => {
	large_icons = !large_icons
	localStorage.setItem("large_icons", large_icons)
}

// Moving functions

let moving_items = []

// We need to detect if shift is pressed so we can select multiple items
let shift_pressed = false
let last_selected_node = -1
const detect_shift = (e) => {
	if (e.key === "Shift") {
		shift_pressed = e.type === "keydown"
	}
}

const select_node = index => {
	if (shift_pressed) {
		// If shift is pressed we do a range select. We select all files between
		// the last selected file and the file that is being selected now
		let id_low = Math.min(last_selected_node, index)
		let id_high = Math.max(last_selected_node, index)

		for (let i = id_low; i <= id_high; i++) {
			if (i != last_selected_node) {
				nav.children[i].fm_selected = !nav.children[i].fm_selected
			}
		}
	} else {
		nav.children[index].fm_selected = !nav.children[index].fm_selected
	}

	last_selected_node = index
}

// When the directory is reloaded we want to keep our selection, so this
// function watches the children array for changes and updates the selection
// when it changes
$: update($nav.children)
const update = (children) => {
	creating_dir = false

	// Highlight the files which were previously selected
	for (let i = 0; i < children.length; i++) {
		for (let j = 0; j < moving_items.length; j++) {
			if (moving_items[j].path === children[i].path) {
				children[i].fm_selected = true
			}
		}
	}
}

let moving_files = 0
let moving_directories = 0
const move_start = () => {
	moving_files = 0
	moving_directories = 0
	moving_items = nav.children.reduce((acc, child) => {
		if (child.fm_selected) {
			if (child.type === "file") {
				moving_files++
			} else if (child.type === "dir") {
				moving_directories++
			}
			acc.push(child)
		}
		return acc
	}, [])
	mode = "moving"
}

const move_here = async () => {
	nav.set_loading(true)

	let target_dir = nav.base.path + "/"

	try {
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
		nav.reload()
	}
}

onMount(() => {
	if(typeof Storage !== "undefined") {
		directory_view = localStorage.getItem("directory_view")
		large_icons = localStorage.getItem("large_icons") === "true"
	}
	if (directory_view === "" || directory_view === null) {
		directory_view = "list"
	}
})
</script>

<svelte:window on:keydown={detect_shift} on:keyup={detect_shift} />

<div
	class="container"
	use:drop_target={{
		upload: (files) => upload_widget.upload_files(files),
		shadow: "var(--highlight_color) 0 0 10px 2px inset",
	}}
>
	<div class="width_container">
		{#if mode === "viewing"}
			<SearchBar nav={nav}/>

			<div class="toolbar">
				<button on:click={navigate_back} title="Back">
					<i class="icon">arrow_back</i>
				</button>
				<button on:click={() => nav.navigate_up()} disabled={$nav.path.length <= 1} title="Up">
					<i class="icon">north</i>
				</button>
				<button on:click={() => nav.reload()} title="Refresh directory listing">
					<i class="icon">refresh</i>
				</button>

				<button on:click={() => {show_hidden = !show_hidden}} title="Toggle hidden files">
					{#if show_hidden}
						<i class="icon">visibility_off</i>
					{:else}
						<i class="icon">visibility</i>
					{/if}
				</button>

				<button on:click={() => toggle_view()} title="Switch between gallery view and list view">
					{#if directory_view === "list"}
						<i class="icon">collections</i>
					{:else if directory_view === "gallery"}
						<i class="icon">list</i>
					{/if}
				</button>

				<button class="button_large_icons" on:click={() => toggle_large_icons()} title="Switch between large and small icons">
					{#if large_icons}
						<i class="icon">zoom_out</i>
					{:else}
						<i class="icon">zoom_in</i>
					{/if}
				</button>

				<div class="toolbar_spacer"></div>
				{#if $nav.permissions.update}
					<button on:click={() => upload_widget.pick_files()} title="Upload files to this directory">
						<i class="icon">cloud_upload</i>
					</button>

					<Button click={() => {creating_dir = !creating_dir}} highlight={creating_dir} icon="create_new_folder" title="Make folder"/>

					<button on:click={() => file_importer.open()} title="Import files from list">
						<i class="icon">move_to_inbox</i>
					</button>

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
				<Button click={() => nav.navigate_up()} disabled={$nav.path.length <= 1} icon="north"/>
				<div class="toolbar_spacer">
					Moving {moving_files} files and {moving_directories} directories
				</div>
				<Button click={() => {creating_dir = !creating_dir}} highlight={creating_dir} icon="create_new_folder" title="Make folder"/>
				<Button click={move_here} highlight icon="done" label="Move here"/>
			</div>
		{/if}

		{#if creating_dir}
			<CreateDirectory nav={nav} />
		{/if}

		{#if $nav.base.path === "/me"}
			<div class="highlight_shaded" style="background-color: rgba(255, 255, 0, 0.05); border-radius: 0;">
				The filesystem is experimental!
				<a href="/filesystem">Please read the guide</a>
			</div>
		{/if}
	</div>


	{#if $nav.base.abuse_type !== undefined}
		<div class="highlight_red">
			This directory has received an abuse report. It cannot be
			shared.<br/>
			Type of abuse: {$nav.base.abuse_type}<br/>
			Report time: {formatDate($nav.base.abuse_report_time, true, true, true)}
		</div>
	{/if}

	<slot></slot>

	{#if directory_view === "list"}
		<ListView
			nav={nav}
			show_hidden={show_hidden}
			large_icons={large_icons}
			on:node_click={node_click}
			on:node_context={node_context}
			on:node_share_click={node_share_click}
			on:node_settings={node_settings}
			on:node_branding={node_branding}
			on:node_select={node_select}
		/>
	{:else if directory_view === "gallery"}
		<GalleryView
			nav={nav}
			show_hidden={show_hidden}
			large_icons={large_icons}
			on:node_click={node_click}
			on:node_context={node_context}
			on:node_settings={node_settings}
			on:node_select={node_select}
		/>
	{/if}
</div>

<FileImporter nav={nav} bind:this={file_importer} />

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
	padding-top: 4px;
	padding-bottom: 4px;
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

/* Large icon mode only supported on wide screens. Hide the button on small screen */
@media (max-width: 500px) {
	.button_large_icons {
		display: none;
	}
}
</style>
