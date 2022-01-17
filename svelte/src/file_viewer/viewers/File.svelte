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

<h1>You are viewing a file on pixeldrain</h1>
<img src={file.icon_href} alt="File icon" class="icon">
<div class="description">
	Name: {file.name}<br/>
	Type: {file.mime_type}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">save</i>
		<span>Download</span>
	</button>
</div>
<br/><br/>
<LargeFileMessage file={file}></LargeFileMessage>

<style>
.icon {
	display: inline-block;
	vertical-align: middle;
}
.description {
	display: inline-block;
	text-align: left;
	padding-left: 8px;
	vertical-align: middle;
	max-width: 600px;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 16px;
	padding: 8px;
}
</style>
