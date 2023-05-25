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

export let fs_navigator
export let edit_window

export let state
let viewer
let viewer_type = ""

$: state_update(state.base)
const state_update = async (base) => {
	// Update the viewer area with the right viewer type
	viewer_type = fs_node_type(base)

	console.debug("Previewing file", base, "viewer type", viewer_type)

	// Render the viewer component and set the file type
	await tick()
	if (viewer) {
		viewer.update()
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
	/>
{:else if viewer_type === "audio"}
	<Audio state={state} on:open_sibling/>
{:else if viewer_type === "image"}
	<Image state={state} on:open_sibling/>
{:else if viewer_type === "video"}
	<Video state={state} bind:this={viewer} on:open_sibling/>
{:else if viewer_type === "pdf"}
	<Pdf state={state}/>
{:else if viewer_type === "text"}
	<Text state={state}/>
{:else if viewer_type === "torrent"}
	<Torrent state={state} bind:this={viewer} on:loading on:download/>
{:else if viewer_type === "zip"}
	<Zip state={state} bind:this={viewer} on:loading on:download />
{:else}
	<File state={state} on:download/>
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
