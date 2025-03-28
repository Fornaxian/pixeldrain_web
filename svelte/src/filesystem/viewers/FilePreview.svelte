<script lang="ts">
import { onMount, tick } from "svelte";
import Spinner from "util/Spinner.svelte";
import { fs_node_type, fs_thumbnail_url } from "filesystem/FilesystemAPI";
import FileManager from "filesystem/filemanager/FileManager.svelte";
import Audio from "./Audio.svelte";
import File from "./File.svelte";
import Image from "./Image.svelte";
import Pdf from "./PDF.svelte";
import Text from "./Text.svelte";
import Video from "./Video.svelte";
import Torrent from "./Torrent.svelte";
import Zip from "./Zip.svelte";
import CustomBanner from "./CustomBanner.svelte";
import { stats } from "lib/StatsSocket"
import SlowDown from "layout/SlowDown.svelte";
import type { FSNavigator } from "filesystem/FSNavigator";
import FsUploadWidget from "filesystem/upload_widget/FSUploadWidget.svelte";
import EditWindow from "filesystem/edit_window/EditWindow.svelte";

export let nav: FSNavigator
export let upload_widget: FsUploadWidget
export let edit_window: EditWindow

let viewer: any
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
		return true
	}
	return false
}
export const toggle_mute = () => {
	if (viewer && viewer.toggle_mute) {
		viewer.toggle_mute()
		return true
	}
	return false
}
export const toggle_fullscreen = () => {
	if (viewer && viewer.toggle_fullscreen) {
		viewer.toggle_fullscreen()
		return true
	}
	return false
}
export const seek = (delta: number) => {
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
	<FileManager nav={nav} upload_widget={upload_widget} edit_window={edit_window}>
		<CustomBanner path={$nav.path}/>
	</FileManager>
{:else if $nav.context.premium_transfer === false && $stats.limits.transfer_limit_used > $stats.limits.transfer_limit}
	<SlowDown
		on:download
		file_size={$nav.base.file_size}
		file_name={$nav.base.name}
		file_type={$nav.base.file_type}
		icon_href={fs_thumbnail_url($nav.base.path, 256, 256)}
	/>
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
	<File nav={nav} on:download on:details>
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
