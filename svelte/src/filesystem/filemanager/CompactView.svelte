<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume } from "./../../util/Formatting.svelte";
import { fs_encode_path, fs_node_icon } from "../FilesystemAPI.mjs"

let dispatch = createEventDispatcher()

export let nav
export let show_hidden = false
export let large_icons = false
</script>

<div class="directory">
	{#each $nav.children as child, index (child.path)}
		<a
			href={"/d"+fs_encode_path(child.path)}
			on:click|preventDefault={() => dispatch("node_click", index)}
			on:contextmenu={e => dispatch("node_context", {event: e, index: index})}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
		>
			<img src={fs_node_icon(child, 64, 64)} class="node_icon" class:large_icons alt="icon"/>
			<div class="node_name">
				{child.name}
			</div>
		</a>
	{/each}
</div>

<style>
.directory {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
	gap: 8px;
	margin: 8px;
	max-width: 100%;
	overflow: hidden;
}
.node {
	display: flex;
	flex-direction: row;
	text-decoration: none;
	color: var(--body_text-color);
	padding: 2px;
	align-items: center;
	background: var(--input_background);
	border-radius: 4px;
	gap: 6px;
}
.node:hover:not(.node_selected) {
	background: var(--input_hover_background);
	color: var(--input_text);
	text-decoration: none;
}
.node.node_selected {
	background-color: var(--highlight_color) !important;
	color: var(--highlight_text_color);
}
.node_icon {
	flex: 0 0 content;
	height: 2em;
	width: 2em;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	flex: 1 1 content;
	word-break: break-all;
	line-height: 1em;
}
.hidden {
	display: none;
}

/* Large icon mode only supported on wide screens */
@media (min-width: 500px) {
	.node_icon.large_icons {
		height: 4em;
		width: 4em;
	}
}
</style>
