<script>
import { onMount } from 'svelte';
import { formatDate, formatDataVolume, formatThousands, formatNumber } from '../util/Formatting.svelte'
import { fs_get_file_url, fs_get_node } from './FilesystemAPI.svelte'
import Sharebar from './Sharebar.svelte'
import Spinner from '../util/Spinner.svelte'
import Modal from '../util/Modal.svelte'
import FileManager from './filemanager/FileManager.svelte';
import Audio from './viewers/Audio.svelte';
import Image from './viewers/Image.svelte';
import Video from './viewers/Video.svelte';
import { current_component } from 'svelte/internal';

// Elements
let file_viewer
let header_bar

let toolbar_visible = (window.innerWidth > 800)
let toolbar_toggle = () => {
	toolbar_visible = !toolbar_visible
	if (!toolbar_visible) {
		sharebar.setVisible(false)
	}
}

let sharebar
let sharebar_visible = false
let details
let details_visible = false
let download_frame

// State
let state = {
	bucket: initialNode.bucket,
	parents: initialNode.parents,
	base: initialNode.base,

	path_root: "/d/"+initialNode.bucket.id,
	loading: true,
	viewer_type: ""
}

// Tallys
$: total_directories = state.base.children.reduce((acc, cur) => {
	if (cur.type === "dir") {
		acc++
	}
	return acc
}, 0)
$: total_files = state.base.children.reduce((acc, cur) => {
	if (cur.type === "file") {
		acc++
	}
	return acc
}, 0)
$: total_file_size = state.base.children.reduce((acc, cur) => acc + cur.file_size, 0)

const navigate = (path, pushHist) => {
	state.loading = true

	fs_get_node(
		state.bucket.id, path,
	).then(resp => {
		window.document.title = resp.base.name+" ~ pixeldrain"
		if (pushHist) {
			window.history.pushState(
				{}, window.document.title, "/d/"+resp.bucket.id+resp.base.path,
			)
		}

		openNode(resp)
	}).catch(err => {
		console.error(err)
		alert(err)
	}).finally(() => {
		state.loading = false
	})
}

const openNode = (node) => {
	// Sort directory children
	node.base.children.sort((a, b) => {
		// Sort directories before files
		console.log(a)
		if (a.type !== b.type) {
			return a.type === "file" ? 1 : -1
		}
		return a.name.localeCompare(b.name)
	})

	// Update shared state
	state.bucket = node.bucket
	state.parents = node.parents
	state.base = node.base

	// Update the viewer area with the right viewer type
	if (state.base.type === "bucket" || state.base.type === "dir") {
		state.viewer_type = "dir"
	} else if (state.base.file_type.startsWith("image")) {
		state.viewer_type = "image"
	} else if (
		state.base.file_type.startsWith("audio") ||
		state.base.file_type === "application/ogg" ||
		state.base.name.endsWith(".mp3")
	) {
		state.viewer_type = "audio"
	} else if (
		state.base.file_type.startsWith("video") ||
		state.base.file_type === "application/matroska" ||
		state.base.file_type === "application/x-matroska"
	) {
		state.viewer_type = "video"
	} else {
		state.viewer_type = ""
	}

	// Remove spinner
	state.loading = false
}
onMount(() => openNode(initialNode))

window.onpopstate = (e) => {
    if(e.state){
		let locsplit = document.location.pathname.split(state.bucket.id+"/", 2)
		navigate(decodeURIComponent(locsplit[1]))
    }
};

const keydown = e => {
	switch (e.key) {
		case 'Escape':
			hide();
			return;
		case 'i':
			details_window.toggle()
	}
};

const download = () => {
	download_frame.src = fs_get_file_url(state.bucket.id, state.base.path) + "?attach"
}

</script>

<svelte:window on:keydown={keydown}/>

<div bind:this={file_viewer} class="file_viewer">
	{#if state.loading}
	<div style="position: absolute; right: 0; top: 0; height: 48px; width: 48px; z-index: 100;">
		<Spinner></Spinner>
	</div>
	{/if}

	<div bind:this={header_bar} class="file_viewer_headerbar highlight_1">
		<button on:click={toolbar_toggle} class="button_toggle_toolbar" class:button_highlight={toolbar_visible}>
			<i class="icon">menu</i>
		</button>
		<a href="/" id="button_home" class="button button_home"><i class="icon">home</i></a>
		<div class="file_viewer_headerbar_title">
			{#each state.parents as parent}
			<div class="breadcrumb breadcrumb_button" on:click={() => {navigate(parent.path, true)}}>{parent.name}</div> /
			{/each}
			<div class="breadcrumb breadcrumb_last">{state.base.name}</div>
		</div>
	</div>
	<div class="list_navigator"></div>
	<div class="file_viewer_window">
		<div class="toolbar" class:toolbar_visible><div><div>
			{#if state.base.type === "file"}
			<div class="toolbar_label">Size</div>
			<div class="toolbar_statistic">{formatDataVolume(state.base.file_size, 3)}</div>
			{:else if state.base.type === "dir" || state.base.type === "bucket"}
			<div class="toolbar_label">Directories</div>
			<div class="toolbar_statistic">{formatThousands(total_directories, 3)}</div>
			<div class="toolbar_label">Files</div>
			<div class="toolbar_statistic">{formatThousands(total_files, 3)}</div>
			<div class="toolbar_label">Total size</div>
			<div class="toolbar_statistic">{formatDataVolume(total_file_size, 3)}</div>
			{/if}

			{#if state.base.type === "file"}
			<button on:click={download} class="toolbar_button button_full_width">
				<i class="icon">save</i> Download
			</button>
			{/if}
			<button id="btn_download_list" class="toolbar_button button_full_width" style="display: none;">
				<i class="icon">save</i> DL all files
			</button>
			<button id="btn_copy" class="toolbar_button button_full_width">
				<i class="icon">content_copy</i> <u>C</u>opy Link
			</button>
			<button on:click={sharebar.toggle} class="toolbar_button button_full_width" class:button_highlight={sharebar_visible}>
				<i class="icon">share</i> Share
			</button>
			<button on:click={details.toggle} class="toolbar_button button_full_width" class:button_highlight={details_visible}>
				<i class="icon">help</i> Deta<u>i</u>ls
			</button>
			<button id="btn_edit" class="toolbar_button button_full_width" style="display: none;">
				<i class="icon">edit</i> <u>E</u>dit
			</button>
		</div></div></div>
		<Sharebar bind:this={sharebar}></Sharebar>

		<div class="file_viewer_file_preview" class:toolbar_visible>
			{#if state.viewer_type === "dir"}
			<FileManager state={state} on:navigate={e => {navigate(e.detail, true)}} on:loading={e => {state.loading = e.detail}}></FileManager>
			{:else if state.viewer_type === "audio"}
			<Audio state={state}></Audio>
			{:else if state.viewer_type === "image"}
			<Image state={state}></Image>
			{:else if state.viewer_type === "video"}
			<Video state={state}></Video>
			{/if}
		</div>
	</div>

	<!-- This frame will load the download URL when a download button is pressed -->
	<iframe bind:this={download_frame} title="Frame for downloading files" style="display: none; width: 1px; height: 1px;"></iframe>

	<Modal bind:this={details} title="Details" width="600px">
		<table style="min-width: 100%;">
			<tr><td colspan="2"><h3>Node details</h3></td></tr>
			<tr><td>Name</td><td>{state.base.name}</td></tr>
			<tr><td>Path</td><td>{state.base.path}</td></tr>
			<tr><td>Type</td><td>{state.base.type}</td></tr>
			<tr><td>Date created</td><td>{formatDate(state.base.date_created, true, true, true)}</td></tr>
			<tr><td>Date modified</td><td>{formatDate(state.base.date_modified, true, true, true)}</td></tr>
			{#if state.base.type === "file"}
			<tr><td>File type</td><td>{state.base.file_type}</td></tr>
			<tr><td>File size</td><td>{formatDataVolume(state.base.file_size)}</td></tr>
			{/if}
			<tr><td colspan="2"><h3>Bucket details</h3></td></tr>
			<tr><td>ID</td><td>{state.bucket.id}</td></tr>
			<tr><td>Name</td><td>{state.bucket.name}</td></tr>
			<tr><td>Date created</td><td>{formatDate(state.bucket.date_created, true, true, true)}</td></tr>
			<tr><td>Date modified</td><td>{formatDate(state.bucket.date_modified, true, true, true)}</td></tr>
		</table>
	</Modal>
</div>

<style>
/* Viewer container */
.file_viewer {
	position: absolute;
	display: flex;
	flex-direction: column;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	overflow: hidden;
}

/* Headerbar (row 1) */
.file_viewer > .file_viewer_headerbar {
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	text-align: left;
	z-index: 10;
	box-shadow: none;
	padding: 4px;
}

/* Headerbar components */
.file_viewer > .file_viewer_headerbar > * {
	flex-grow: 0;
	flex-shrink: 0;
	margin-left: 4px;
	margin-right: 4px;
	display: inline;
	align-self: center;
}
.file_viewer > .file_viewer_headerbar > .file_viewer_headerbar_title {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	flex-direction: row;
}
.breadcrumb {
	border-radius: 1em;
	min-width: 1em;
	text-align: center;
	line-height: 1.2em;
	padding: 3px 8px;
	margin: 2px 6px;
	word-break: break-all;
}
.breadcrumb_button {
	cursor: pointer;
	background-color: var(--layer_2_color);
	transition: 0.2s background-color, 0.2s color;
}
.breadcrumb_button:hover, .breadcrumb_button:focus, .breadcrumb_button:active {
	color: var(--input_text_color);
	background-color: var(--input_color);
}
.breadcrumb_last {
	color: var(--highlight_text_color);
	background-color: var(--highlight_color);
}

.button_home::after {
	content: "pixeldrain";
}
@media (max-width: 600px) {
	.button_home::after {
		content: "pd";
	}
}
/* List Navigator (row 2) */
.file_viewer > .list_navigator {
	flex-grow: 0;
	flex-shrink: 0;
	position: relative;
	display: none; /* Becomes visible if the page is a list */
	width: 100%;
	background-color: var(--layer_1_color);
	text-align: center;
	line-height: 1em;
	overflow-x: auto;
	overflow-y: hidden;
	z-index: 50;
	white-space: nowrap;
}
/* .file_viewer > .list_navigator > .list_item{
	height: 2.6em !important;
	width: 220px !important;
} */

/* File preview area (row 3) */
.file_viewer > .file_viewer_window {
	flex-grow: 1;
	flex-shrink: 1;
	position: relative;
	display: inline-block;
	width: auto;
	height: auto;
	margin: 0;
	z-index: 9;
}
.file_viewer > .file_viewer_window > .file_viewer_file_preview {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	display: inline-block;
	min-height: 100px;
	min-width: 100px;
	text-align: center;
	vertical-align: middle;
	transition: left 0.5s;
	overflow: hidden;
	box-shadow: inset 2px 2px 8px var(--shadow_color);
}

/* Toolbar */
.toolbar {
	position: absolute;
	width: 8em;
	z-index: 49;
	overflow: hidden;
	float: left;
	background-color: var(--layer_1_color);
	left: -8em;
	bottom: 0;
	top: 0;
	padding: 0;
	text-align: left;
	transition: left 0.5s;
}
.toolbar.toolbar_visible { left: 0; }
.file_viewer > .file_viewer_window > .file_viewer_file_preview.toolbar_visible { left: 8em; }

/* Workaround to hide the scrollbar in non webkit browsers, it's really ugly' */
.toolbar > div {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	right: -30px;
	overflow-y: scroll;
	overflow-x: hidden;
}
.toolbar > div > div {
	position: absolute;
	left: 0;
	top: 0;
	width: 8em;
	height: auto;
	text-align: center;
}
.toolbar_button{
	text-align: left;
}
.toolbar_label {
	text-align: left;
	padding-left: 10px;
	font-size: 0.8em;
	line-height: 0.7em;
	margin-top: 0.5em;
}
.toolbar_statistic {
	text-align: center;
}

</style>