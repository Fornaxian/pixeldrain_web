<script>
import { formatDataVolume } from '../../util/Formatting.svelte'
import { fs_delete_node } from './../FilesystemAPI.svelte'
import { createEventDispatcher } from 'svelte'
import CreateDirectory from './CreateDirectory.svelte'
import FileUploader from './FileUploader.svelte'
let dispatch = createEventDispatcher()

export let state
let mode = "viewing"
let creating_dir = false
let uploader

const node_click = (index) => {
	creating_dir = false

	// We prefix our custom state properties with fm_ to not interfere with
	// other modules
	if (mode === "viewing") {
		dispatch("navigate", state.base.children[index].path)
	} else if (mode === "selecting") {
		state.base.children[index].fm_selected = !state.base.children[index].fm_selected
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

const node_icon = node => {
	if (node.type === "dir") {
		return "/res/img/mime/folder.png"
	}

	switch (node.file_type) {
		case "image/gif":
			return "/res/img/mime/image-gif.png"
		case "image/png", "image/apng":
			return "/res/img/mime/image-png.png"
		case "image/jpeg":
			return "/res/img/mime/image-jpeg.png"
		case "application/pdf":
			return "/res/img/mime/pdf.png"
		case "application/ogg":
			return "/res/img/mime/audio.png"
	}

	if (node.file_type.startsWith("audio/")) {
		return "/res/img/mime/audio.png"
	} else if (node.file_type.startsWith("video/")) {
		return "/res/img/mime/video.png"
	} else if (node.file_type.startsWith("text/")) {
		return "/res/img/mime/text.png"
	} else if (node.file_type.startsWith("image/")) {
		return "/res/img/mime/image-png.png"
	} else if (node.file_type.startsWith("application/")) {
		return "/res/img/mime/archive.png"
	}
	return "/res/img/mime/empty.png"
}

const delete_selected = () => {
	if (mode !== "selecting") {
		return
	}

	let count = state.base.children.reduce((acc, cur) => {
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
	state.base.children.forEach(child => {
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
	state.base.children.forEach((child, i) => {
		if (child.fm_selected) {
			state.base.children[i].fm_selected = false
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
			<div class="toolbar_spacer"></div>
			{#if state.bucket.permissions.update}
				<button on:click={uploader.picker}><i class="icon">cloud_upload</i></button>
				<button on:click={() => {creating_dir = true}}><i class="icon">create_new_folder</i></button>

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

		<FileUploader bind:this={uploader} bucket_id={state.bucket.id} target_dir={state.base.path} on:finished={reload}></FileUploader>

		<div class="directory">
			<tr>
				<td></td>
				<td>name</td>
				<td>size</td>
			</tr>

			{#if creating_dir}
				<CreateDirectory state={state} on:done={() => {reload(); creating_dir = false;}} on:loading></CreateDirectory>
			{/if}

			{#each state.base.children as child, index}
				<a
					href={state.path_root+child.path}
					on:click|preventDefault={() => {node_click(index)}}
					class="node"
					class:node_selected={child.fm_selected}>
					<td>
						<img src={node_icon(child)} class="node_icon" alt="icon"/>
					</td>
					<td class="node_name">
						{child.name}
					</td>
					<td class="node_size">
						{#if child.type === "file"}
							{formatDataVolume(child.file_size, 3)}
						{/if}
					</td>
				</a>
			{/each}
		</div>
	</div>
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
	display: inline-block;
	max-width: 94%;
	width: 1000px;
	margin: 0;
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

.directory {
	display: table;
	position: relative;
	overflow-x: auto;
	overflow-y: hidden;
	width: 100%;
	margin: 16px 0 16px 0;
	text-align: left;
	background-color: var(--layer_1_color);
	box-shadow: 1px 1px 5px var(--shadow_color);
	border-collapse: collapse;
}
.directory > * { display: table-row; }
.directory > * > * { display: table-cell; }
.directory :global(.node) {
	display: table-row;
	text-decoration: none;
	color: var(--text-color);
	padding: 6px;
}
.directory :global(.node:not(:last-child)) {
	border-bottom: 1px solid var(--layer_2_color);
}
.directory :global(.node:hover:not(.node_selected)) {
	background-color: var(--input_color_dark);
	color: var(--input_text_color);
	text-decoration: none;
}
.directory :global(.node.node_selected) {
	background-color: var(--highlight_color) !important;
	color: var(--highlight_text_color);
}
.directory :global(.node.node_delete) {
	background-color: var(--danger_color) !important;
	color: var(--highlight_text_color);
}
.directory :global(td) {
	padding: 4px;
	vertical-align: middle;
}
.directory :global(.node_icon) {
	height: 32px;
	width: 32px;
	vertical-align: middle;
}
.directory :global(.node_name) {
	width: 100%;
	overflow: hidden;
	line-height: 1.2em;
	word-break: break-all;
}
.directory :global(.node_size) {
	min-width: 50px;
	white-space: nowrap;
}
</style>
