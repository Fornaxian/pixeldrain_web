<script>
import { createEventDispatcher, onMount } from 'svelte'
import ListView from './ListView.svelte'
import GalleryView from './GalleryView.svelte'
import Modal from '../../util/Modal.svelte';
import Navigator from '../Navigator.svelte';
import LoadingIndicator from '../../util/LoadingIndicator.svelte';

let fs_navigator
let state
let modal
let dispatch = createEventDispatcher()
let directory_view = ""
let loading = false
const loading_evt = e => loading = e.detail
let large_icons = false
let show_hidden = false
export let select_multiple = false

export const open = path => {
	modal.show()
	fs_navigator.navigate(path, false)
}

$: selected_files = state && state.children.reduce((acc, file) => {
	if (file.fm_selected) {
		acc++
	}
	return acc
}, 0)

// Navigation functions

const node_click = e => {
	let index = e.detail

	if (state.children[index].type === "dir") {
		fs_navigator.navigate(state.children[index].path, true)
	} else {
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
const node_select = e => {
	let index = e.detail
	mode = "selecting"
	state.children[index].fm_selected = !state.children[index].fm_selected
}
const navigate_up = () => {
	// Go to the path of the last parent
	if (state.path.length > 1) {
		fs_navigator.navigate(state.path[state.path.length-2].path, true)
	}
}
const toggle_view = () => {
	if (directory_view === "list") {
		directory_view = "gallery"
	} else {
		directory_view = "list"
	}

	localStorage.setItem("directory_view", directory_view)
}

// We need to detect if shift is pressed so we can select multiple items
let shift_pressed = false
let last_selected_node = -1
const detect_shift = (e) => {
	if (e.key === "Shift") {
		shift_pressed = e.type === "keydown"
	}
}

const select_node = index => {
	if (select_multiple && shift_pressed) {
		// If shift is pressed we do a range select. We select all files between
		// the last selected file and the file that is being selected now
		let id_low = Math.min(last_selected_node, index)
		let id_high = Math.max(last_selected_node, index)

		for (let i = id_low; i <= id_high; i++) {
			if (i != last_selected_node) {
				state.children[i].fm_selected = !state.children[i].fm_selected
			}
		}
	} else {
		// Deselect all other entries first
		if (!select_multiple) {
			for (let i = 0; i < state.children.length; i++) {
				state.children[i].fm_selected = false
			}
		}
		state.children[index].fm_selected = !state.children[index].fm_selected
	}

	last_selected_node = index
}

let done = () => {
	let selected_files = []
	for (let i = 0; i < state.children.length; i++) {
		if (state.children[i].fm_selected) {
			selected_files.push(state.children[i])
		}
	}

	if (selected_files.length > 0) {
		dispatch("files", selected_files)
	}
	modal.hide()
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

<Navigator
	history_enabled={false}
	bind:this={fs_navigator}
	bind:state
	on:loading={loading_evt}
/>

<Modal bind:this={modal} width="900px">
	<div class="header" slot="title">
		<button class="button round" on:click={modal.hide}>
			<i class="icon">close</i>
		</button>
		<button on:click={navigate_up} disabled={state.path.length <= 1} title="Up">
			<i class="icon">north</i>
		</button>
		<button on:click={fs_navigator.reload()} title="Refresh directory listing">
			<i class="icon">refresh</i>
		</button>

		<div class="title">
			Selected {selected_files} files
		</div>

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

		<button class="button button_highlight round" on:click={done}>
			<i class="icon">done</i> Pick
		</button>
	</div>
	{#if directory_view === "list"}
		<ListView
			state={state}
			show_hidden={show_hidden}
			large_icons={large_icons}
			on:node_click={node_click}
			on:node_context={node_context}
			on:node_select={node_select}
		/>
	{:else if directory_view === "gallery"}
		<GalleryView
			state={state}
			show_hidden={show_hidden}
			large_icons={large_icons}
			on:node_click={node_click}
			on:node_context={node_context}
			on:node_select={node_select}
		/>
	{/if}

	<LoadingIndicator loading={loading}/>
</Modal>

<style>
.header {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	font-size: 1em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.title {
	flex-grow: 1;
	flex-shrink: 1;
	text-align: center;
	font-size: 1.2em;
}
</style>
