<script>
import { createEventDispatcher } from "svelte";

import Spinner from "../util/Spinner.svelte";
import Video from "./viewers/Video.svelte";
import Audio from "./viewers/Audio.svelte";
import Image from "./viewers/Image.svelte";
import PDF from "./viewers/PDF.svelte";
import Text from "./viewers/Text.svelte";
import File from "./viewers/File.svelte";
import Abuse from "./viewers/Abuse.svelte";
import { file_type } from "./FileUtilities.svelte";

let viewer_type = "loading"
export let file = {
	id: "",
	name: "",
	mime_type: "",
	abuse_type: "",
}

$: update_file(file.id)
const update_file = () => {
	if (file.id === "") {
		viewer_type = "loading"
		return
	}else if (file.abuse_type !== "") {
		viewer_type = "abuse"
		return
	}

	viewer_type = file_type(file)
}

let dispatch = createEventDispatcher()
const download = () => { dispatch("download") }
const next = () => { dispatch("next") }
const prev = () => { dispatch("prev") }

</script>

<div class="file_container">
	{#if viewer_type === "loading"}
		<div class="center" style="width: 100px; height: 100px;">
			<Spinner></Spinner>
		</div>
	{:else if viewer_type === "abuse"}
		<Abuse file={file}></Abuse>
	{:else if viewer_type === "image"}
		<Image file={file}></Image>
	{:else if viewer_type === "video"}
		<Video file={file} on:download={download} on:prev={prev} on:next={next}></Video>
	{:else if viewer_type === "audio"}
		<Audio file={file} on:prev={prev} on:next={next}></Audio>
	{:else if viewer_type === "pdf"}
		<PDF file={file}></PDF>
	{:else if viewer_type === "text"}
		<Text file={file}></Text>
	{:else if viewer_type === "file"}
		<File file={file} on:download={download}></File>
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
