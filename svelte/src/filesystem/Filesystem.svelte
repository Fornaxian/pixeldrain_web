<script>
import { onMount } from 'svelte';
import { formatDate, formatDataVolume, formatThousands } from '../util/Formatting.svelte'
import { fs_get_file_url, fs_get_node } from './FilesystemAPI.svelte'
import Sharebar from './Sharebar.svelte'
import Spinner from '../util/Spinner.svelte'
import Modal from '../util/Modal.svelte'
import FileManager from './filemanager/FileManager.svelte';
import Audio from './viewers/Audio.svelte';
import Image from './viewers/Image.svelte';
import Video from './viewers/Video.svelte';
import PDF from './viewers/PDF.svelte';
import PixeldrainLogo from '../util/PixeldrainLogo.svelte';

// Elements
let file_viewer
let header_bar

let toolbar_visible = (window.innerWidth > 600)
let toolbar_toggle = () => {
	toolbar_visible = !toolbar_visible
	if (!toolbar_visible) {
		sharebar_visible = false
	}
}

let sharebar
let sharebar_visible = false
$: {
	if (typeof(sharebar) !== "undefined") {
		sharebar.setVisible(sharebar_visible)
	}
}

let details
let details_visible = false
let download_frame

// State
let state = {
	bucket: window.initial_node.bucket,
	parents: window.initial_node.parents,
	base: window.initial_node.base,
	children: window.initial_node.children,

	// Passwords for accessing this bucket. Passwords are not always required
	// but sometimes they are
	read_password: "",
	write_password: "",

	// These are used to navigate forward and backward within a directory (using
	// the previous and next buttons on the toolbar). The cached siblings will
	// be used so that we don't need to make an extra request to the parent
	// directory. The siblings_path variable is used to verify that the parent
	// directory is still the same. If it's sifferent the siblings array is not
	// used
	siblings_path: "",
	siblings: null,

	// Root path of the bucket. Used for navigation by prepending it to a file
	// path
	path_root: "/d/"+window.initial_node.bucket.id,
	loading: true,
	viewer_type: "",
	shuffle: false,
}

// Tallys
$: total_directories = state.children.reduce((acc, cur) => cur.type === "dir" ? acc + 1 : acc, 0)
$: total_files = state.children.reduce((acc, cur) => cur.type === "file" ? acc + 1 : acc, 0)
$: total_file_size = state.children.reduce((acc, cur) => acc + cur.file_size, 0)

const sort_children = children => {
	children.sort((a, b) => {
		// Sort directories before files
		if (a.type !== b.type) {
			return a.type === "dir" ? -1 : 1
		}
		return a.name.localeCompare(b.name)
	})
}

const navigate = (path, pushHist) => {
	state.loading = true

	fs_get_node(state.bucket.id, path).then(resp => {
		window.document.title = resp.base.name+" ~ pixeldrain"
		if (pushHist) {
			window.history.pushState(
				{}, window.document.title, "/d/"+resp.bucket.id+resp.base.path,
			)
		}

		open_node(resp)
	}).catch(err => {
		console.error(err)
		alert(err)
	}).finally(() => {
		state.loading = false
	})
}

const open_node = (node) => {
	// If the new node is a child of the previous node we save the parent's
	// children array
	if (node.parents.length > 0 && node.parents[node.parents.length-1].path === state.base.path) {
		console.debug("Current parent path and new node path match. Saving siblings")

		state.siblings_path = node.parents[node.parents.length-1].path
		state.siblings = state.children
	}

	// Sort directory children
	sort_children(node.children)

	// Update shared state
	state.bucket = node.bucket
	state.parents = node.parents
	state.base = node.base
	state.children = node.children

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
	} else if (
		state.base.file_type === "application/pdf" ||
		state.base.file_type === "application/x-pdf"
	) {
		state.viewer_type = "pdf"
	} else {
		state.viewer_type = ""
	}

	// Remove spinner
	state.loading = false
}
onMount(() => open_node(window.initial_node))

// Opens a sibling of the currently open file. The offset is relative to the
// file which is currently open. Give a positive number to move forward and a
// negative number to move backward
const open_sibling = async offset => {
	if (state.parents.length == 0) {
		return
	}

	state.loading = true

	// Check if we already have siblings cached
	if (state.siblings != null && state.siblings_path == state.parents[state.parents.length - 1].path) {
		console.debug("Using cached siblings")
	} else {
		console.debug("Cached siblings not available. Fetching new")
		try {
			let resp = await fs_get_node(state.bucket.id, state.parents[state.parents.length - 1].path)

			// Sort directory children to make sure the order is consistent
			sort_children(resp.base.children)

			// Save new siblings in global state
			state.siblings_path = state.parents[state.parents.length - 1].path
			state.siblings = resp.base.children
		} catch (err) {
			console.error(err)
			alert(err)
			state.loading = false
			return
		}
	}

	let next_sibling = null

	if (state.shuffle) {
		// Shuffle is on, pick a random sibling
		for (let i = 0; i < 10; i++) {
			next_sibling = state.siblings[Math.floor(Math.random()*state.siblings.length)]

			// If we selected the same sibling we already have open we try
			// again. Else we break the loop
			if (next_sibling.name !== state.base.name) {
				break
			}
		}
	} else {
		// Loop over the parent node's children to find the one which is
		// currently open. Then, if possible, we save the one which comes before
		// or after it
		for (let i = 0; i < state.siblings.length; i++) {
			if (
				state.siblings[i].name === state.base.name &&
				i+offset >= 0 && // Prevent underflow
				i+offset < state.siblings.length // Prevent overflow
			) {
				next_sibling = state.siblings[i+offset]
				break
			}
		}
	}

	// If we found a sibling we open it
	if (next_sibling !== null) {
		console.debug("Opening sibling", next_sibling)
		navigate(next_sibling.path,true)
	} else {
		console.debug("No siblings found")
		state.loading = false
	}
}

// Capture browser back and forward navigation buttons
window.onpopstate = (e) => {
    if(e.state){
		// Get the part of the URL after the bucket ID and navigate to it
		let locsplit = document.location.pathname.split(state.bucket.id+"/", 2)
		navigate(decodeURIComponent(locsplit[1]))
    }
};

const keydown = e => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}

	switch (e.key) {
		case "Escape":
			hide();
			break;
		case "i":
			details_window.toggle()
			break;
		case "s":
			download()
			break;
		case "r":
			state.shuffle = !state.shuffle
			break;
		case "a", "ArrowLeft":
			open_sibling(-1)
			break;
		case "d", "ArrowRight":
			open_sibling(1)
			break;
	}
};

const download = () => {
	download_frame.src = fs_get_file_url(state.bucket.id, state.base.path) + "?attach"
}
const share = () => {

}

</script>

<svelte:window on:keydown={keydown} />

<div bind:this={file_viewer} class="file_viewer">
	{#if state.loading}
	<div style="position: absolute; right: 0; top: 0; height: 48px; width: 48px; z-index: 100;">
		<Spinner></Spinner>
	</div>
	{/if}

	<div bind:this={header_bar} class="file_viewer_headerbar">
		<button on:click={toolbar_toggle} class="button_toggle_toolbar round" class:button_highlight={toolbar_visible}>
			<i class="icon">menu</i>
		</button>
		<a href="/" id="button_home" class="button button_home round">
			<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0 0.2em 0 0; color: currentColor;"></PixeldrainLogo>
		</a>
		<div class="file_viewer_headerbar_title">
			{#each state.parents as parent}
				<a
					href={state.path_root+parent.path}
					class="breadcrumb button"
					on:click|preventDefault={() => {navigate(parent.path, true)}}>
					{parent.name}
				</a> /
			{/each}
			<div class="breadcrumb button button_highlight">{state.base.name}</div>
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

			<div class="button_row">
				<button on:click={() => {open_sibling(-1)}}>
					<i class="icon">skip_previous</i>
				</button>
				<button on:click={() => {state.shuffle = !state.shuffle}} class:button_highlight={state.shuffle}>
					<i class="icon">shuffle</i>
				</button>
				<button on:click={() => {open_sibling(1)}}>
					<i class="icon">skip_next</i>
				</button>
			</div>

			{#if state.base.type === "file"}
			<button on:click={download} class="toolbar_button">
				<i class="icon">save</i> Download
			</button>
			{/if}
			<button id="btn_download_list" class="toolbar_button" style="display: none;">
				<i class="icon">save</i> DL all files
			</button>
			<button id="btn_copy" class="toolbar_button">
				<i class="icon">content_copy</i> <u>C</u>opy Link
			</button>
			<button on:click={() => sharebar_visible = !sharebar_visible} class="toolbar_button" class:button_highlight={sharebar_visible}>
				<i class="icon">share</i> Share
			</button>
			<button on:click={details.toggle} class="toolbar_button" class:button_highlight={details_visible}>
				<i class="icon">help</i> Deta<u>i</u>ls
			</button>
			<button id="btn_edit" class="toolbar_button" style="display: none;">
				<i class="icon">edit</i> <u>E</u>dit
			</button>
		</div></div></div>
		<Sharebar bind:this={sharebar}></Sharebar>

		<div class="file_viewer_file_preview checkers" class:toolbar_visible>
			{#if state.viewer_type === "dir"}
			<FileManager state={state} on:navigate={e => {navigate(e.detail, true)}} on:loading={e => {state.loading = e.detail}}></FileManager>
			{:else if state.viewer_type === "audio"}
			<Audio state={state} on:open_sibling={e => {open_sibling(e.detail)}}></Audio>
			{:else if state.viewer_type === "image"}
			<Image state={state} on:open_sibling={e => {open_sibling(e.detail)}}></Image>
			{:else if state.viewer_type === "video"}
			<Video state={state} on:open_sibling={e => {open_sibling(e.detail)}}></Video>
			{:else if state.viewer_type === "pdf"}
			<PDF state={state}></PDF>
			{/if}
		</div>
	</div>

	<!-- This frame will load the download URL when a download button is pressed -->
	<iframe bind:this={download_frame} title="Frame for downloading files" style="display: none; width: 1px; height: 1px;"></iframe>

	<Modal bind:this={details} title="Details" width="600px" role="prompt">
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
	background: var(--body_background);
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
.file_viewer > .file_viewer_headerbar > .button_toggle_toolbar > .icon {
	font-size: 1.6em;
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
	padding: 4px 8px;
	margin: 2px 6px;
	word-break: break-all;
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
	border-radius: 16px;
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
.toolbar_button {
	text-align: left;
	width: calc(100% - 6px);
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
.button_row {
	display: flex;
	flex-direction: row;
}
.button_row > * {
	flex: 1 1 auto;
}

</style>
