<script>
import FileManager from "../filemanager/FileManager.svelte";
import Audio from "./Audio.svelte";
import File from "./File.svelte";
import Image from "./Image.svelte";
import Pdf from "./PDF.svelte";
import Text from "./Text.svelte";
import Video from "./Video.svelte";

export let navigator
export let state
export let toolbar_visible
export let edit_window
</script>

<div class="file_preview checkers" class:toolbar_visible>
	{#if state.viewer_type === "dir"}
		<FileManager
			navigator={navigator}
			state={state}
			edit_window={edit_window}
			on:loading
		/>
	{:else if state.viewer_type === "audio"}
		<Audio state={state} on:open_sibling/>
	{:else if state.viewer_type === "image"}
		<Image state={state} on:open_sibling/>
	{:else if state.viewer_type === "video"}
		<Video state={state} on:open_sibling/>
	{:else if state.viewer_type === "pdf"}
		<Pdf state={state}/>
	{:else if state.viewer_type === "text"}
		<Text state={state}/>
	{:else}
		<File state={state} on:download/>
	{/if}
</div>

<style>
.file_preview {
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
	border-radius: 12px;
	border: 2px solid var(--separator);
}

.file_preview.toolbar_visible {
	left: 8em;
}
</style>
