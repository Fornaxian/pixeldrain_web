<script>
import { onMount } from 'svelte';
import LoadingIndicator from '../util/LoadingIndicator.svelte';
import EditWindow from './edit_window/EditWindow.svelte';
import Toolbar from './Toolbar.svelte';
import Breadcrumbs from './Breadcrumbs.svelte';
import DetailsWindow from './DetailsWindow.svelte';
import FilePreview from './viewers/FilePreview.svelte';
import SearchView from './SearchView.svelte';
import UploadWidget from './upload_widget/UploadWidget.svelte';
import { fs_path_url } from './FilesystemUtil';
import { branding_from_path } from './edit_window/Branding.js'
import Menu from './Menu.svelte';
import { Navigator } from "./Navigator"
import { writable } from 'svelte/store';

let file_viewer
let file_preview
let toolbar
let upload_widget
let download_frame
let details_visible = false
let edit_window
let edit_visible = false
let view = "file"

const loading = writable(true)
const nav = new Navigator(true)

onMount(() => {
	nav.loading = loading
	nav.open_node(window.initial_node, false)

	// Subscribe to navigation updates. This function returns a deconstructor
	// which we can conveniently return from our mount function as well
	return nav.subscribe(nav => {
		if (!nav.initialized) {
			return
		}

		// Custom CSS rules for the whole viewer
		document.documentElement.style = branding_from_path(nav.path)

		loading.set(false)
	})
})

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
				edit_window.edit(nav.base, true, "file")
			}
			break;
		case "s":
			download()
			break;
		case "r":
			nav.shuffle = !nav.shuffle
			break;
		case "/":
		case "f":
			search()
			break
		case "a":
		case "ArrowLeft":
			nav.open_sibling(-1)
			break;
		case "d":
		case "ArrowRight":
			nav.open_sibling(1)
			break;
		case " ": // Spacebar pauses / unpauses video and audio playback
			if (file_preview) {
				file_preview.toggle_playback()
			}
			break
		case "h":
			file_preview.seek(-20)
			break
		case "j":
			file_preview.seek(-5)
			break
		case "k":
			file_preview.seek(5)
			break
		case "l":
			file_preview.seek(20)
			break
		case ",":
			file_preview.seek(-0.04) // Roughly a single frame.. assuming 25fps
			break
		case ".":
			file_preview.seek(0.04)
			break
		default:
			action_performed = false
	}

	if (action_performed) {
		e.preventDefault()
	}
};

const download = () => {
	if (nav.base.type === "file") {
		download_frame.src = fs_path_url(nav.base.path) + "?attach"
	} else if (nav.base.type === "dir") {
		download_frame.src = fs_path_url(nav.base.path) + "?bulk_download"
	}
}

const search = async () => {
	if (view === "search") {
		view = "file"
		return
	}

	// If we are not currently in a directory, then we navigate up to the parent
	// directory
	if (nav.base.type !== "dir") {
		await nav.navigate_up()
	}

	view = "search"
}
</script>

<svelte:window on:keydown={keydown} />

<div bind:this={file_viewer} class="file_viewer">
	<div class="headerbar">
		<Menu/>
		<Breadcrumbs nav={nav}/>
	</div>

	<div class="viewer_area">
		<Toolbar
			bind:this={toolbar}
			nav={nav}
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
					nav={nav}
					edit_window={edit_window}
					on:open_sibling={e => nav.open_sibling(e.detail)}
					on:download={download}
					on:upload_picker={() => upload_widget.pick_files()}
				/>
			{:else if view === "search"}
				<SearchView nav={nav} on:done={() => {view = "file"}} />
			{/if}
		</div>
	</div>

	<!-- This frame will load the download URL when a download button is pressed -->
	<iframe
		bind:this={download_frame}
		title="Frame for downloading files"
		style="display: none; width: 1px; height: 1px;">
	</iframe>

	<DetailsWindow nav={nav} bind:visible={details_visible} />

	<EditWindow nav={nav} bind:this={edit_window} bind:visible={edit_visible} />

	<UploadWidget nav={nav} bind:this={upload_widget} drop_upload />

	<LoadingIndicator loading={$loading}/>
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
	color: var(--body_text_color);

	background-image: var(--background_image, var(--background_pattern));
	background-color: var(--background_pattern_color);
	background-size: var(--background_image_size, initial);
	background-position: var(--background_image_position, initial);
	background-repeat: var(--background_image_repeat, repeat);
}

/* Headerbar (row 1) */
.headerbar {
	flex: 0 0 0;
	display: flex;
	flex-direction: row;
	text-align: left;
	box-shadow: none;
	background-color: var(--shaded_background);
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
	overflow: auto;
	border: 1px solid var(--separator);
}
</style>
