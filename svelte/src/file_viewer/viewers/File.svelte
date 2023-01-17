<script>
import { createEventDispatcher } from "svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import IconBlock from "./IconBlock.svelte";
let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	icon_href: "",
	show_ads: false,
	download_speed_limit: 0,
}
</script>

<h1>{file.name}</h1>
<IconBlock icon_href={file.icon_href}>
	Type: {file.mime_type}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>
<br/>
{#if file.show_ads}
	<BandwidthUsage file={file} on:reload/>
{/if}

<style>
h1 {
	text-shadow: 1px 1px 3px var(--shadow_color);
	line-break: anywhere;
}
.icon {
	display: inline-block;
	vertical-align: middle;
}
</style>
