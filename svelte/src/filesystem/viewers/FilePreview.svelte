<script>
import { onMount, tick } from "svelte";
import Spinner from "../../util/Spinner.svelte";
import { fs_node_type } from "../FilesystemUtil";
import FileManager from "../filemanager/FileManager.svelte";
import Audio from "./Audio.svelte";
import File from "./File.svelte";
import Image from "./Image.svelte";
import Pdf from "./PDF.svelte";
import Text from "./Text.svelte";
import Video from "./Video.svelte";
import Torrent from "./Torrent.svelte";
import Zip from "./Zip.svelte";
import CustomBanner from "./CustomBanner.svelte";

export let nav
export let edit_window

let viewer
let viewer_type = ""
let last_path = ""

onMount(() => nav.subscribe(state_update))

const state_update = async () => {
	if (!nav.initialized || nav.base.path === last_path) {
		return
	}
	last_path = nav.base.path

	// Update the viewer area with the right viewer type
	viewer_type = fs_node_type(nav.base)

	console.debug("Previewing file", nav.base, "viewer type", viewer_type)

	// Render the viewer component and set the file type
	await tick()
	if (viewer && viewer.update) {
		viewer.update()
	}
}

export const toggle_playback = () => {
	if (viewer && viewer.toggle_playback) {
		viewer.toggle_playback()
	}
}
export const seek = delta => {
	if (viewer && viewer.seek) {
		viewer.seek(delta)
	}
}
</script>

{#if viewer_type === ""}
	<div class="center">
		<Spinner></Spinner>
	</div>
{:else if viewer_type === "dir"}
	<FileManager nav={nav} edit_window={edit_window} on:upload_picker>
		<CustomBanner path={$nav.path}/>
	</FileManager>
{:else if viewer_type === "audio"}
	<Audio nav={nav} bind:this={viewer}>
		<CustomBanner path={$nav.path}/>
	</Audio>
{:else if viewer_type === "image"}
	<Image nav={nav} bind:this={viewer}/>
{:else if viewer_type === "video"}
	<Video nav={nav} bind:this={viewer} on:open_sibling/>
{:else if viewer_type === "pdf"}
	<Pdf nav={nav}/>
{:else if viewer_type === "text"}
	<Text nav={nav} bind:this={viewer}>
		<CustomBanner path={$nav.path}/>
	</Text>
{:else if viewer_type === "torrent"}
	<Torrent nav={nav} bind:this={viewer} on:download>
		<CustomBanner path={$nav.path}/>
	</Torrent>
{:else if viewer_type === "zip"}
	<Zip nav={nav} bind:this={viewer} on:download>
		<CustomBanner path={$nav.path}/>
	</Zip>
{:else}
	<File nav={nav} on:download>
		<CustomBanner path={$nav.path}/>
	</File>
{/if}

<style>
.center{
	position: relative;
	display: block;
	margin: auto;
	width: 100px;
	max-width: 100%;
	height: 100px;
	max-height: 100%;
	top: 50%;
	transform: translateY(-50%);
}
</style>
