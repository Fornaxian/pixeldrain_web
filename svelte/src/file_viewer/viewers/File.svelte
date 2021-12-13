<script>
import { createEventDispatcher } from "svelte";
import LargeFileMessage from "./LargeFileMessage.svelte";
let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	icon_href: "",
	show_ads: false,
}
</script>

<div class="container">
	<h1>You are viewing a file on pixeldrain</h1>
	<img src={file.icon_href} alt="File icon" class="icon">
	<div class="description">
		Name: {file.name}<br/>
		Type: {file.mime_type}<br/>
		No preview is available for this file type. Download to view it locally.
		<br/>
		<button class="button_highlight" on:click={() => {dispatch("download")}}>
			<i class="icon">save</i> Download
		</button>
	</div>
	<br/>
	<LargeFileMessage file={file}></LargeFileMessage>
</div>

<style>
.icon {
	display: inline-block;
	vertical-align: top;
}
.description {
	display: inline-block;
	text-align: left;
	padding-left: 8px;
	vertical-align: middle;
	max-width: 600px;
}
.container {
	position: relative;
	display: block;
	height: 100%;
	width: 100%;
	text-align: center;
	overflow: hidden;
}
</style>
