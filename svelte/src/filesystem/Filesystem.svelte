<script lang="ts">
import { onMount } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import EditWindow from "./edit_window/EditWindow.svelte";
import Toolbar from "./Toolbar.svelte";
import Breadcrumbs from "./Breadcrumbs.svelte";
import DetailsWindow from "./DetailsWindow.svelte";
import FilePreview from "./viewers/FilePreview.svelte";
import FSUploadWidget from "./upload_widget/FSUploadWidget.svelte";
import { fs_download, type FSPath } from "./FilesystemAPI";
import Menu from "./Menu.svelte";
import { FSNavigator } from "./FSNavigator"
import { writable } from "svelte/store";
import TransferLimit from "file_viewer/TransferLimit.svelte";
import { stats } from "lib/StatsSocket"
import { css_from_path } from "filesystem/edit_window/Branding";
import AffiliatePrompt from "user_home/AffiliatePrompt.svelte";

let file_viewer: HTMLDivElement
let file_preview: FilePreview
let toolbar: Toolbar
let upload_widget: FSUploadWidget
let details_visible = false
let edit_window: EditWindow
let edit_visible = false

const loading = writable(true)
const nav = new FSNavigator(true)

onMount(() => {
	nav.loading = loading
	nav.open_node((window as any).initial_node as FSPath, false)

	// Subscribe to navigation updates. This function returns a deconstructor
	// which we can conveniently return from our mount function as well
	return nav.subscribe(nav => {
		if (!nav.initialized) {
			return
		}

		// Custom CSS rules for the whole viewer
		document.documentElement.style = css_from_path(nav.path)

		loading.set(false)
	})
})

const keydown = (e: KeyboardEvent) => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	} else if ((document.activeElement as any).type !== undefined && (document.activeElement as any).type === "text") {
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
			fs_download(nav.base)
			break;
		case "r":
			nav.shuffle = !nav.shuffle
			break;
		case "f": // F fullscreen
			if (toolbar) {
				toolbar.toggle_fullscreen()
			}
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
				if (file_preview.toggle_playback()) {
					e.preventDefault()
					e.stopPropagation()
				}
			}
			break
		case "m": // M mutes / unmutes audio
			if (file_preview) {
				file_preview.toggle_mute()
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
			file_preview={file_preview}
			bind:details_visible={details_visible}
			edit_window={edit_window}
			bind:edit_visible={edit_visible}
			on:download={() => fs_download(nav.base)}
		/>

		<div class="file_preview">
			<FilePreview
				bind:this={file_preview}
				nav={nav}
				upload_widget={upload_widget}
				edit_window={edit_window}
				on:open_sibling={e => nav.open_sibling(e.detail)}
				on:download={() => fs_download(nav.base)}
				on:details={() => details_visible = !details_visible}
			/>
		</div>
	</div>

	{#if $nav.context.premium_transfer === false}
		<div class="download_limit">
			{#if $stats.limits.transfer_limit_used > $stats.limits.transfer_limit}
				<div class="highlight_yellow">
					Your free download limit has been used up and your download
					speed has been limited to 1 MiB/s. <a href="/#pro"
					target="_blank">Upgrade to premium</a> to continue fast
					downloading
				</div>
			{:else}
				<TransferLimit/>
			{/if}
		</div>
	{/if}

	<DetailsWindow nav={nav} bind:visible={details_visible} />

	<EditWindow nav={nav} bind:this={edit_window} bind:visible={edit_visible} />

	<!-- This one is included at the highest level so uploads can keep running
		even when the user navigates to a different directory -->
	<FSUploadWidget nav={nav} bind:this={upload_widget} />

	<AffiliatePrompt/>

	<LoadingIndicator loading={$loading}/>
</div>

<style>
:global(*) {
	transition: background-color 0.2s,
		border 0.2s,
		border-top 0.2s,
		border-right 0.2s,
		border-bottom 0.2s,
		border-left 0.2s,
		color 0.2s;
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
	backdrop-filter: blur(4px);
}

/* File preview area (row 2) */
.viewer_area {
	flex: 1 1 0;
	display: flex;
	flex-direction: row;
	overflow: hidden;
}

/* Download limit gauge (row 3) */
.download_limit {
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	text-align: center;
	background-color: var(--shaded_background);
	backdrop-filter: blur(4px);
}

/* This max-width needs to be synced with the .toolbar max-width in
Toolbar.svelte and the .label max-width in FileStats.svelte */
@media (max-width: 1000px) {
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
