<script>
import { tick } from "svelte";
import Spinner from "../../util/Spinner.svelte";
import Video from "./Video.svelte";
import Audio from "./Audio.svelte";
import Image from "./Image.svelte";
import PDF from "./PDF.svelte";
import Text from "./Text.svelte";
import File from "./File.svelte";
import Abuse from "./Abuse.svelte";
import { file_type } from "../FileUtilities.svelte";
import RateLimit from "./RateLimit.svelte";
import Torrent from "./Torrent.svelte";
import { stats } from "src/util/StatsSocket.js"
import Zip from "./Zip.svelte";
import SlowDown from "src/layout/SlowDown.svelte";

let viewer
let viewer_type = "loading"
export let is_list = false
let current_file
let premium_download = false

export const set_file = async file => {
	if (file.id === "") {
		viewer_type = "loading"
		return
	} else if (file.abuse_type !== "") {
		viewer_type = "abuse"
	} else if (
		file.availability === "file_rate_limited_captcha_required" ||
		file.availability === "ip_download_limited_captcha_required"
	) {
		viewer_type = "rate_limit"
	} else {
		viewer_type = file_type(file)
	}

	console.log("opening file", file)
	current_file = file
	premium_download = !file.show_ads

	// Render the viewer component and set the file type
	await tick()
	if (viewer) {
		viewer.set_file(file)
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

{#if viewer_type === "loading"}
	<div class="center">
		<Spinner></Spinner>
	</div>
{:else if viewer_type === "abuse"}
	<Abuse bind:this={viewer} on:download></Abuse>
{:else if !premium_download && $stats.limits.transfer_limit_used > $stats.limits.transfer_limit}
	<SlowDown
		on:download
		file_size={current_file.size}
		file_name={current_file.name}
		file_type={current_file.mime_type}
		icon_href={current_file.icon_href}
	/>
{:else if viewer_type === "rate_limit"}
	<RateLimit bind:this={viewer} on:download></RateLimit>
{:else if viewer_type === "image"}
	<Image bind:this={viewer} is_list={is_list} on:prev on:next on:loading></Image>
{:else if viewer_type === "video"}
	<Video bind:this={viewer} is_list={is_list} on:loading on:download on:prev on:next on:reload></Video>
{:else if viewer_type === "audio"}
	<Audio bind:this={viewer} is_list={is_list} on:loading on:prev on:next on:reload></Audio>
{:else if viewer_type === "pdf"}
	<PDF bind:this={viewer}></PDF>
{:else if viewer_type === "text"}
	<Text bind:this={viewer}></Text>
{:else if viewer_type === "torrent"}
	<Torrent bind:this={viewer} on:loading on:download />
{:else if viewer_type === "zip"}
	<Zip bind:this={viewer} on:loading on:download />
{:else if viewer_type === "file"}
	<File bind:this={viewer} on:download on:reload></File>
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
