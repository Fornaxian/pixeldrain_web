<script>
import { createEventDispatcher } from "svelte";
import LargeFileMessage from "./LargeFileMessage.svelte";
import TextBlock from "./TextBlock.svelte";
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
<TextBlock>
	Name: {file.name}<br/>
	Type: {file.mime_type}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</TextBlock>
<br/><br/>
<LargeFileMessage file={file}></LargeFileMessage>

<style>
.icon {
	display: inline-block;
	vertical-align: middle;
}
</style>
