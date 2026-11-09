<script lang="ts">
import BandwidthUsage from "./BandwidthUsage.svelte";
import IconBlock from "layout/IconBlock.svelte";
import FileTitle from "layout/FileTitle.svelte";
import { formatDataVolume } from "util/Formatting";
let { on_download, children }: {
	on_download: () => void;
	children?: import('svelte').Snippet;
} = $props();

export const set_file = f => file = f
let file = $state({
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	icon_href: "",
	show_ads: false,
	download_speed_limit: 0,
})
</script>

<FileTitle title={file.name}/>

{@render children?.()}

<IconBlock icon_href={file.icon_href}>
	Type: {file.mime_type}<br/>
	Size: {formatDataVolume(file.size, 3)}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" onclick={on_download}>
		<i class="icon i_download"></i>
		<span>Download</span>
	</button>
</IconBlock>

{#if file.show_ads}
	<BandwidthUsage/>
{/if}
