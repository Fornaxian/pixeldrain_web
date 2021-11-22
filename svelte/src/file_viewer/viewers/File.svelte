<script>
import { createEventDispatcher } from "svelte";
import { formatDuration } from "../../util/Formatting.svelte";
let dispatch = createEventDispatcher()

export let file = {
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	icon_href: "",
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
		{#if file.size > 1e9}
		<hr/>
		Your download speed is currently limited to 4 MiB/s. Downloading this
		file for free will take {formatDuration((file.size/4194304)*1000)}.
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12" class="button">
			Upgrade to Pro
		</a>
		to download at the fastest speed available.
		{/if}
	</div>
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
