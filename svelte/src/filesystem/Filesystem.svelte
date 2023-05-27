<script>
import { onMount, tick } from 'svelte';
import PixeldrainLogo from '../util/PixeldrainLogo.svelte';
import LoadingIndicator from '../util/LoadingIndicator.svelte';
import EditWindow from './EditWindow.svelte';
import { fs_file_url } from './FilesystemUtil';
import Toolbar from './Toolbar.svelte';
import Breadcrumbs from './Breadcrumbs.svelte';
import DetailsWindow from './DetailsWindow.svelte';
import Navigator from './Navigator.svelte';
import FilePreview from './viewers/FilePreview.svelte';
import SearchView from './SearchView.svelte';
import UploadWidget from './upload_widget/UploadWidget.svelte';

let loading = true
let toolbar_visible = (window.innerWidth > 600)
let file_preview
let download_frame
let details_visible = false
let edit_window
let edit_visible = false
let view = "file"

let fs_navigator
let state = {
	path: window.initial_node.path,
	base_index: window.initial_node.base_index,
	children: window.initial_node.children,
	permissions: window.initial_node.permissions,

	// Shortcuts
	base: window.initial_node.path[window.initial_node.base_index],
	root: window.initial_node.path[0],

	// Passwords for accessing this bucket. Passwords are not always required
	// but sometimes they are
	read_password: "",
	write_password: "",

	// Root path of the bucket. Used for navigation by prepending it to a file
	// path
	path_root: "/d/"+window.initial_node.path[0].id,
	shuffle: false,
}

onMount(() => fs_navigator.open_node(window.initial_node, false))

const keydown = e => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}

	switch (e.key) {
		case "i":
			details_visible = !details_visible
			break;
		case "e":
			if (edit_visible) {
				edit_visible = false
			} else {
				edit_window.edit(state.base, true)
			}
			break;
		case "s":
			download()
			break;
		case "r":
			state.shuffle = !state.shuffle
			break;
		case "/":
		case "f":
			search()
			break
		case "a":
		case "ArrowLeft":
			fs_navigator.open_sibling(-1)
			break;
		case "d":
		case "ArrowRight":
			fs_navigator.open_sibling(1)
			break;
	}

	e.preventDefault()
};

const download = () => {
	download_frame.src = fs_file_url(state.root.id, state.base.path) + "?attach"
}

const search = async () => {
	if (view === "search") {
		view = "file"
		return
	}

	if (state.base.type !== "dir") {
		await fs_navigator.navigate(state.path[state.path.length-2].path)
	}

	view = "search"
}

const loading_evt = e => {
	loading = e.detail
}
</script>

<svelte:window on:keydown={keydown} />

<Navigator
	bind:this={fs_navigator}
	bind:state
	on:loading={loading_evt}
	on:navigation_complete={() => {
		// Reset the view to the file view if we were in search view
		view = "file"
	}}
/>

<div class="file_viewer">
	<div class="headerbar">
		<button
			on:click={() => toolbar_visible = !toolbar_visible}
			class="button_toggle_toolbar round"
			class:button_highlight={toolbar_visible}
		>
			<i class="icon">menu</i>
		</button>
		<a href="/" id="button_home" class="button button_home round">
			<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0 0.2em 0 0; color: currentColor;"/>
		</a>
		<div class="breadcrumbs">
			<Breadcrumbs state={state} fs_navigator={fs_navigator}/>
		</div>
	</div>

	<div class="viewer_area">
		<div class="file_preview checkers" class:toolbar_visible>
			{#if view === "file"}
				<FilePreview
					bind:this={file_preview}
					fs_navigator={fs_navigator}
					state={state}
					edit_window={edit_window}
					on:loading={loading_evt}
					on:open_sibling={e => fs_navigator.open_sibling(e.detail)}
					on:download={download}
				/>
			{:else if view === "search"}
				<SearchView
					state={state}
					fs_navigator={fs_navigator}
					on:loading={loading_evt}
				/>
			{/if}
		</div>

		<Toolbar
			visible={toolbar_visible}
			fs_navigator={fs_navigator}
			state={state}
			bind:details_visible={details_visible}
			edit_window={edit_window}
			bind:edit_visible={edit_visible}
			bind:view={view}
			on:download={download}
			on:search={search}
		/>
	</div>

	<!-- This frame will load the download URL when a download button is pressed -->
	<iframe
		bind:this={download_frame}
		title="Frame for downloading files"
		style="display: none; width: 1px; height: 1px;">
	</iframe>
</div>

<DetailsWindow
	state={state}
	bind:visible={details_visible}
/>

<EditWindow
	bind:this={edit_window}
	bind:visible={edit_visible}
	bucket={state.root.id}
	fs_navigator={fs_navigator}
	on:loading={loading_evt}
/>

<UploadWidget fs_state={state} drop_upload on:uploads_finished={() => fs_navigator.reload()}/>

<LoadingIndicator loading={loading}/>

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
.headerbar {
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	text-align: left;
	box-shadow: none;
	padding: 4px;
}

/* Headerbar components */
.headerbar > * {
	flex-grow: 0;
	flex-shrink: 0;
	margin-left: 4px;
	margin-right: 4px;
	display: inline;
	align-self: center;
}
.button_toggle_toolbar > .icon {
	font-size: 1.6em;
}
.breadcrumbs {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	flex-direction: row;
}
.button_home::after {
	content: "pixeldrain";
}
@media (max-width: 600px) {
	.button_home::after {
		content: "pd";
	}
}
/* File preview area (row 2) */
.viewer_area {
	flex-grow: 1;
	flex-shrink: 1;
	position: relative;
	display: inline-block;
	width: auto;
	height: auto;
	margin: 0;
}

.file_preview {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	display: block;
	min-height: 100px;
	min-width: 100px;
	transition: left 0.25s;
	overflow: auto;
	text-align: center;
	border-radius: 8px;
	border: 2px solid var(--separator);
}

.file_preview.toolbar_visible {
	left: 8em;
}
</style>
