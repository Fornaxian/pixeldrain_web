<script>
import { createEventDispatcher } from "svelte"
import { fs_node_icon, fs_node_type } from "../FilesystemUtil";
let dispatch = createEventDispatcher()

export let state
export let show_hidden = false
</script>

<div class="gallery">
	{#each state.children as child, index (child.path)}
		<a class="file"
			href={state.path_root+child.path_uri}
			on:click|preventDefault={() => {dispatch("node_click", index)}}
			class:selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
			title={child.name}
		>
			<div
				class="icon_container"
				class:cover={fs_node_type(child) === "image" || fs_node_type(child) === "video"}
				style='background-image: url("{fs_node_icon(child, 256, 256)}");'>
			</div>
			{child.name}
		</a>
	{/each}
</div>

<style>
.gallery{
	padding: 16px;
	overflow: hidden;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
.file{
	width: 200px;
	max-width: 42%;
	height: 200px;
	margin: 8px;
	overflow: hidden;
	border-radius: 8px;
	background: var(--input_background);
	word-break: break-all;
	text-align: center;
	line-height: 1.2em;
	display: inline-block;
	text-overflow: ellipsis;
	text-decoration: none;
	vertical-align: top;
	color: var(--body_text_color);
	transition: background 0.2s;
}
.file:hover {
	background: var(--input_hover_background);
}
.selected {
	box-shadow: 0 0 2px 2px var(--highlight_color);
	text-decoration: none;
}
.icon_container {
	margin: 3px;
	height: 148px;
	border-radius: 6px;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
	font-size: 22px;
	text-align: left;
}
.icon_container.cover {
	background-size: cover;
}
.hidden {
	display: none;
}
</style>
