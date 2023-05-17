<script>
import { createEventDispatcher } from "svelte";
import IconBlock from "../../file_viewer/viewers/IconBlock.svelte";
import { fs_thumbnail_url } from "../FilesystemUtil";
let dispatch = createEventDispatcher()

export let state
</script>

<h1>{state.base.name}</h1>

<IconBlock icon_href={fs_thumbnail_url(state.root.id, state.base.path)}>
	Type: {state.base.file_type}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

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
