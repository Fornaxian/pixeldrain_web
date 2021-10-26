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

let file_type = "loading"
export let file = {
	id: "",
	name: "",
	mime_type: "",
	abuse_type: "",
}

$: update_file(file.id)
const update_file = () => {
	if (file.id === "") {
		file_type = "loading"
		return
	}

	if (file.abuse_type !== "") {
		file_type = "abuse"
	} else if (file.mime_type.startsWith("image")) {
		file_type = "image"
	} else if (
		file.mime_type.startsWith("video") ||
		file.mime_type === "application/matroska" ||
		file.mime_type === "application/x-matroska"
	) {
		file_type = "video"
	} else if (
		file.mime_type.startsWith("audio") ||
		file.mime_type === "application/ogg" ||
		file.name.endsWith(".mp3")
	) {
		file_type = "audio"
	} else if (
		file.mime_type === "application/pdf" ||
		file.mime_type === "application/x-pdf"
	) {
		file_type = "pdf"
	} else if (
		file.mime_type.startsWith("text")
	) {
		file_type = "text"
	} else {
		file_type = "file"
	}
}

let dispatch = createEventDispatcher()
const download = () => { dispatch("download") }
const next = () => { dispatch("next") }
const prev = () => { dispatch("prev") }

</script>

<div class="file_container">
	{#if file_type === "loading"}
		<div class="center" style="width: 100px; height: 100px;">
			<Spinner></Spinner>
		</div>
	{:else if file_type === "abuse"}
		<Abuse file={file}></Abuse>
	{:else if file_type === "image"}
		<Image file={file}></Image>
	{:else if file_type === "video"}
		<Video file={file} on:download={download} on:prev={prev} on:next={next}></Video>
	{:else if file_type === "audio"}
		<Audio file={file} on:prev={prev} on:next={next}></Audio>
	{:else if file_type === "pdf"}
		<PDF file={file}></PDF>
	{:else if file_type === "text"}
		<Text file={file}></Text>
	{:else if file_type === "file"}
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
