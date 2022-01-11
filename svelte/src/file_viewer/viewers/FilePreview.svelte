<script>
import { createEventDispatcher, tick } from "svelte";

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

let viewer
let viewer_type = "loading"

export const set_file = async file => {
	if (file.id === "") {
		viewer_type = "loading"
		return
	} else if (file.abuse_type !== "") {
		viewer_type = "abuse"
	} else if (file.availability === "file_rate_limited_captcha_required") {
		viewer_type = "rate_limit"
	} else {
		viewer_type = file_type(file)
	}

	console.log("opening file", file)

	// Render the viewer component and set the file type
	await tick()
	viewer.set_file(file)
}

let dispatch = createEventDispatcher()
const download = () => { dispatch("download") }
const next = () => { dispatch("next") }
const prev = () => { dispatch("prev") }
const loading = e => {dispatch("loading", e.detail)}

</script>

<div class="file_container">
	{#if viewer_type === "loading"}
		<div class="center" style="width: 100px; height: 100px;">
			<Spinner></Spinner>
		</div>
	{:else if viewer_type === "abuse"}
		<Abuse bind:this={viewer}></Abuse>
	{:else if viewer_type === "rate_limit"}
		<RateLimit bind:this={viewer} on:download={download}></RateLimit>
	{:else if viewer_type === "image"}
		<Image bind:this={viewer} on:loading={loading}></Image>
	{:else if viewer_type === "video"}
		<Video bind:this={viewer} on:loading={loading} on:download={download} on:prev={prev} on:next={next}></Video>
	{:else if viewer_type === "audio"}
		<Audio bind:this={viewer} on:loading={loading} on:prev={prev} on:next={next}></Audio>
	{:else if viewer_type === "pdf"}
		<PDF bind:this={viewer}></PDF>
	{:else if viewer_type === "text"}
		<Text bind:this={viewer}></Text>
	{:else if viewer_type === "torrent"}
		<Torrent bind:this={viewer} on:loading={loading} on:download={download}></Torrent>
	{:else if viewer_type === "file"}
		<File bind:this={viewer} on:download={download}></File>
	{/if}
</div>

<style>
.file_container {
	width: 100%;
	height: 100%;
}
.center{
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	top: 50%;
	transform: translateY(-50%);
}
</style>
