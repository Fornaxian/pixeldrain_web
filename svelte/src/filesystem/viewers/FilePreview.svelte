<script>
import { tick } from "svelte";
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

export let fs_navigator
export let edit_window

export let state
let viewer
let viewer_type = ""
let last_path = ""

$: state_update(state.base)
const state_update = async (base) => {
	if (base.path === last_path) {
		return
	}
	last_path = base.path

	// Update the viewer area with the right viewer type
	viewer_type = fs_node_type(base)

	console.debug("Previewing file", base, "viewer type", viewer_type)

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
</script>

{#if viewer_type === ""}
	<div class="center">
		<Spinner></Spinner>
	</div>
{:else if viewer_type === "dir"}
	<FileManager
		fs_navigator={fs_navigator}
		state={state}
		edit_window={edit_window}
		on:loading
		on:upload_picker
	>
		<CustomBanner path={state.path}/>
	</FileManager>
{:else if viewer_type === "audio"}
	<Audio state={state} bind:this={viewer} fs_navigator={fs_navigator}>
		<CustomBanner path={state.path}/>
	</Audio>
{:else if viewer_type === "image"}
	<Image state={state} bind:this={viewer} on:open_sibling/>
{:else if viewer_type === "video"}
	<Video state={state} bind:this={viewer} on:open_sibling/>
{:else if viewer_type === "pdf"}
	<Pdf state={state}/>
{:else if viewer_type === "text"}
	<Text state={state} bind:this={viewer}>
		<CustomBanner path={state.path}/>
	</Text>
{:else if viewer_type === "torrent"}
	<Torrent state={state} bind:this={viewer} on:loading on:download>
		<CustomBanner path={state.path}/>
	</Torrent>
{:else if viewer_type === "zip"}
	<Zip state={state} bind:this={viewer} on:loading on:download>
		<CustomBanner path={state.path}/>
	</Zip>
{:else}
	<File state={state} on:download>
		<CustomBanner path={state.path}/>
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
