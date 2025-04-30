<script lang="ts">
import { createEventDispatcher } from "svelte"
import { fs_node_icon, fs_node_type, fs_encode_path } from "filesystem/FilesystemAPI";
import type { FSNavigator } from "filesystem/FSNavigator";
import { FileAction } from "./FileManagerLib";
let dispatch = createEventDispatcher()

export let nav: FSNavigator
export let show_hidden = false
export let large_icons = false
</script>

<div class="gallery">
	{#each $nav.children as child, index (child.path)}
		<a class="file"
		href={"/d"+fs_encode_path(child.path)}
			on:click={e => dispatch("file", {index: index, action: FileAction.Click, original: e})}
			on:contextmenu={e => dispatch("file", {index: index, action: FileAction.Context, original: e})}
			class:selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
			class:large_icons
			title={child.name}
		>
			<div
				class="node_icon"
				class:cover={fs_node_type(child) === "image" || fs_node_type(child) === "video"}
				style='background-image: url("{fs_node_icon(child, 256, 256)}");'>
			</div>
			<div class="node_name">
				{child.name}
			</div>
		</a>
	{/each}
</div>

<style>
.gallery {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin: 10px;
	justify-content: center;
}
.file {
	aspect-ratio: 1;
	width: 150px;
	height: 150px;
	overflow: hidden;
	border-radius: 8px;
	background: var(--input_background);
	color: var(--input_text);
	display: flex;
	flex-direction: column;
	transition: background 0.2s;
	text-decoration: none;
	padding: 3px;
	box-shadow: 1px 1px 0px 0px var(--shadow_color);
}
.file.large_icons {
	width: 200px;
	height: 200px;
}

/* On very small screens we switch to grid layout */
@media (max-width: 500px) {
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	}
	.file {
		width: unset;
		height: unset;
		max-width: 200px;
		max-height: 200px;
	}
	.file.large_icons {
		width: unset;
		height: unset;
	}
}
.file:hover {
	background: var(--input_hover_background);
}
.file.selected {
	background: var(--highlight_background);
	color: var(--highlight_text_color);
}
.node_icon {
	flex: 1 1 0;
	border-radius: 6px;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
}
.node_icon.cover {
	background-size: cover;
}
.node_name {
	flex: 0 0 auto;
	word-break: break-all;
	line-clamp: 2;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.hidden {
	display: none;
}
</style>
