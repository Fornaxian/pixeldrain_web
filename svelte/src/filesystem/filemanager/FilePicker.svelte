<script lang="ts">
import { onMount } from "svelte"
import ListView from "./ListView.svelte"
import GalleryView from "./GalleryView.svelte"
import CompactView from "./CompactView.svelte"
import Modal from "util/Modal.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import Breadcrumbs from "filesystem/Breadcrumbs.svelte"
import { FSNavigator } from "filesystem/FSNavigator";
import type { FSNode } from "filesystem/FilesystemAPI";
import { FileAction, type FileEvent } from "./FileManagerLib";

let nav = new FSNavigator(false)
let modal: Modal = $state()
let directory_view = $state("")
let loading = false
let large_icons = $state(false)
let show_hidden = $state(false)
let { select_multiple = false, on_files }: {
	select_multiple?: boolean;
	on_files: (files: FSNode[]) => void;
} = $props();

export const open = (path: string) => {
	modal.show()
	nav.navigate(path, false)
}

let selected_files = $derived($nav.children.reduce((acc, file) => {
	if (file.fm_selected) {
		acc++
	}
	return acc
}, 0))

// Navigation functions

const file_event = (e: FileEvent) => {
	const index = e.index

	switch (e.action) {
	case FileAction.Click:
		e.original.preventDefault()
		if (nav.children[index].type === "dir") {
			nav.navigate(nav.children[index].path, true)
		} else {
			select_node(index)
		}
		break
	case FileAction.Context:
		// If this is a touch event we will select the item
		if (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) {
			e.original.preventDefault()
			select_node(index)
		}
		break
	case FileAction.Select:
		e.original.preventDefault()
		nav.children[index].fm_selected = !nav.children[index].fm_selected
		nav.notify_subscribers()
		break
	}
}

const toggle_view = () => {
	if (directory_view === "list") {
		directory_view = "gallery"
	} else if (directory_view === "gallery") {
		directory_view = "compact"
	} else {
		directory_view = "list"
	}

	localStorage.setItem("directory_view", directory_view)
}

// We need to detect if shift is pressed so we can select multiple items
let shift_pressed = false
let last_selected_node = -1
const detect_shift = (e: KeyboardEvent) => {
	if (e.key === "Shift") {
		shift_pressed = e.type === "keydown"
	}
}

const select_node = (index: number) => {
	if (select_multiple && shift_pressed) {
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
		// Deselect all other entries first
		if (!select_multiple) {
			for (let i = 0; i < nav.children.length; i++) {
				nav.children[i].fm_selected = false
			}
		}
		nav.children[index].fm_selected = !nav.children[index].fm_selected
	}

	last_selected_node = index

	// The nodes are not reactive. This makes the views read the selection again
	nav.notify_subscribers()
}

let done = () => {
	let selected_files: FSNode[] = []
	for (let i = 0; i < nav.children.length; i++) {
		if (nav.children[i].fm_selected) {
			selected_files.push(nav.children[i])
		}
	}

	if (selected_files.length > 0) {
		on_files(selected_files)
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

<svelte:window onkeydown={detect_shift} onkeyup={detect_shift} />

<Modal bind:this={modal} width="900px">
	{#snippet header()}
		<div class="header">
			<button class="button round" onclick={modal.hide}>
				<i class="icon i_close"></i>
			</button>
			<button onclick={() => nav.navigate_up()} disabled={$nav.path.length <= 1} title="Up">
				<i class="icon i_north"></i>
			</button>
			<button onclick={() => nav.reload()} title="Refresh directory listing">
				<i class="icon i_refresh"></i>
			</button>

			<div class="title">
				Selected {selected_files} files
			</div>

			<button onclick={() => {show_hidden = !show_hidden}} title="Toggle hidden files">
				{#if show_hidden}
					<i class="icon i_visibility_off"></i>
				{:else}
					<i class="icon i_visibility"></i>
				{/if}
			</button>

			<button onclick={() => toggle_view()} title="Switch between gallery, list and compact view">
				<i class="icon i_list" class:button_highlight={directory_view === "list"}></i>
				<i class="icon i_collections" class:button_highlight={directory_view === "gallery"}></i>
				<i class="icon i_view_compact" class:button_highlight={directory_view === "compact"}></i>
			</button>

			<button class="button button_highlight round" onclick={done}>
				<i class="icon i_done"></i> Pick
			</button>
		</div>
	{/snippet}

	<Breadcrumbs nav={nav}/>

	{#if directory_view === "list"}
		<ListView
			nav={nav}
			show_hidden={show_hidden}
			large_icons={large_icons}
			hide_edit
			hide_branding
			on_file={file_event}
		/>
	{:else if directory_view === "gallery"}
		<GalleryView
			nav={nav}
			show_hidden={show_hidden}
			large_icons={large_icons}
			on_file={file_event}
		/>
	{:else if directory_view === "compact"}
		<CompactView
			nav={nav}
			show_hidden={show_hidden}
			large_icons={large_icons}
			hide_edit
			on_file={file_event}
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
.icon.button_highlight {
	border-radius: 4px;
}
</style>
