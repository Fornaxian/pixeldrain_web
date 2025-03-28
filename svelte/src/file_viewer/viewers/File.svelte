<script>
import { createEventDispatcher } from "svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import IconBlock from "layout/IconBlock.svelte";
import FileTitle from "layout/FileTitle.svelte";
import { formatDataVolume } from "util/Formatting";
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

<FileTitle title={file.name}/>

<slot></slot>

<IconBlock icon_href={file.icon_href}>
	Type: {file.mime_type}<br/>
	Size: {formatDataVolume(file.size, 3)}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

{#if file.show_ads}
	<BandwidthUsage file={file} on:reload/>
{/if}
