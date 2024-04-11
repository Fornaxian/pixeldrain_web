<script>
import { onMount } from 'svelte';
import LoadingIndicator from '../util/LoadingIndicator.svelte';
import EditWindow from './edit_window/EditWindow.svelte';
import Toolbar from './Toolbar.svelte';
import Breadcrumbs from './Breadcrumbs.svelte';
import DetailsWindow from './DetailsWindow.svelte';
import Navigator from './Navigator.svelte';
import FilePreview from './viewers/FilePreview.svelte';
import SearchView from './SearchView.svelte';
import UploadWidget from './upload_widget/UploadWidget.svelte';
import { fs_path_url } from './FilesystemUtil.js';
import { branding_from_path } from './edit_window/Branding.js'
import Menu from './Menu.svelte';

let loading = true
let file_viewer
let file_preview
let toolbar
let upload_widget
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

	shuffle: false,
}

onMount(() => fs_navigator.open_node(window.initial_node, false))

const keydown = e => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	} else if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}

	let action_performed = true
	switch (e.key) {
		case "c":
			toolbar.copy_link()
			break;
		case "i":
			details_visible = !details_visible
			break;
		case "e":
			if (edit_visible) {
				edit_visible = false
			} else {
				edit_window.edit(state.base, true, "file")
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
		case " ": // Spacebar pauses / unpauses video and audio playback
			if (file_preview) {
				file_preview.toggle_playback()
			}
			break
		default:
			action_performed = false
	}

	if (action_performed) {
		e.preventDefault()
	}
};

const download = () => {
	download_frame.src = fs_path_url(state.base.path) + "?attach"
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

const loading_evt = e => loading = e.detail

// Custom CSS rules for the whole viewer. This is updated by either the
// navigation_complete event or the style_change event
$: update_css(state.path)
const update_css = path => document.documentElement.style = branding_from_path(path)
</script>

<svelte:window on:keydown={keydown} />

<Navigator
	bind:this={fs_navigator}
	bind:state
	on:loading={loading_evt}
/>

<div bind:this={file_viewer} class="file_viewer">
	<div class="headerbar">
		<Menu/>
		<Breadcrumbs state={state} fs_navigator={fs_navigator}/>
	</div>

	<div class="viewer_area">
		<Toolbar
			bind:this={toolbar}
			fs_navigator={fs_navigator}
			state={state}
			file_viewer={file_viewer}
			bind:details_visible={details_visible}
			edit_window={edit_window}
			bind:edit_visible={edit_visible}
			bind:view={view}
			on:download={download}
			on:search={search}
		/>

		<div class="file_preview">
			{#if view === "file"}
				<FilePreview
					bind:this={file_preview}
					fs_navigator={fs_navigator}
					state={state}
					edit_window={edit_window}
					on:loading={loading_evt}
					on:open_sibling={e => fs_navigator.open_sibling(e.detail)}
					on:download={download}
					on:upload_picker={() => upload_widget.pick_files()}
				/>
			{:else if view === "search"}
				<SearchView
					state={state}
					fs_navigator={fs_navigator}
					on:loading={loading_evt}
					on:done={() => {view = "file"}}
				/>
			{/if}
		</div>
	</div>

	<!-- This frame will load the download URL when a download button is pressed -->
	<iframe
		bind:this={download_frame}
		title="Frame for downloading files"
		style="display: none; width: 1px; height: 1px;">
	</iframe>

	<DetailsWindow
		state={state}
		bind:visible={details_visible}
	/>

	<EditWindow
		bind:this={edit_window}
		bind:visible={edit_visible}
		fs_navigator={fs_navigator}
		on:loading={loading_evt}
	/>

	<UploadWidget
		bind:this={upload_widget}
		fs_state={state}
		drop_upload
		on:uploads_finished={() => fs_navigator.reload()}
	/>

	<LoadingIndicator loading={loading}/>
</div>

<style>
:global(*) {
	transition: background-color 0.5s,
		border 0.5s,
		border-top 0.5s,
		border-right 0.5s,
		border-bottom 0.5s,
		border-left 0.5s,
		color 0.5s;
}

/* Viewer container */
.file_viewer {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;

	/* Force some variable usage that is normally out of scope */
	background: var(--body_background);
	color: var(--body_text_color);
}

/* Headerbar (row 1) */
.headerbar {
	flex: 0 0 0;
	display: flex;
	flex-direction: row;
	text-align: left;
	box-shadow: none;
}

/* File preview area (row 2) */
.viewer_area {
	flex: 1 1 0;
	display: flex;
	flex-direction: row;
	overflow: hidden;
}

/* This max-width needs to be synced with the .toolbar max-width in
Toolbar.svelte and the .label max-width in FileStats.svelte */
@media (max-width: 800px) {
	.viewer_area {
		flex-direction: column-reverse;
	}
}

.file_preview {
	flex: 1 1 0;
	border-radius: 8px;
	overflow: auto;
	border: 2px solid var(--separator);
	background-image: var(--background_image, var(--background_pattern));
	background-color: var(--background_pattern_color);
	background-size: var(--background_image_size, initial);
	background-position: var(--background_image_position, initial);
	background-repeat: var(--background_image_repeat, repeat);
}
</style>
