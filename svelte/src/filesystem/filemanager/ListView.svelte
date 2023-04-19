<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume } from "../../util/Formatting.svelte";

let dispatch = createEventDispatcher()

export let state
export let show_hidden = false

const node_icon = node => {
	if (node.type === "dir") {
		// Folders with an ID are publically shared, use the shared folder icon
		if (node.id) {
			return "/res/img/mime/folder-remote.png"
		} else {
			return "/res/img/mime/folder.png"
		}
	}

	switch (node.file_type) {
		case "image/gif":
			return "/res/img/mime/image-gif.png"
		case "image/png", "image/apng":
			return "/res/img/mime/image-png.png"
		case "image/jpeg":
			return "/res/img/mime/image-jpeg.png"
		case "application/pdf":
			return "/res/img/mime/pdf.png"
		case "application/ogg":
			return "/res/img/mime/audio.png"
	}

	if (node.file_type.startsWith("audio/")) {
		return "/res/img/mime/audio.png"
	} else if (node.file_type.startsWith("video/")) {
		return "/res/img/mime/video.png"
	} else if (node.file_type.startsWith("text/")) {
		return "/res/img/mime/text.png"
	} else if (node.file_type.startsWith("image/")) {
		return "/res/img/mime/image-png.png"
	} else if (node.file_type.startsWith("application/")) {
		return "/res/img/mime/archive.png"
	}
	return "/res/img/mime/empty.png"
}

</script>

<div class="directory">
	<tr>
		<td></td>
		<td>name</td>
		<td>size</td>
	</tr>
	{#each state.children as child, index (child.path)}
		<a
			href={state.path_root+child.path_uri}
			on:click|preventDefault={() => {dispatch("node_click", index)}}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
		>
			<td>
				<img src={node_icon(child)} class="node_icon" alt="icon"/>
			</td>
			<td class="node_name">
				{child.name}
			</td>
			<td class="node_size">
				{#if child.type === "file"}
					{formatDataVolume(child.file_size, 3)}
				{/if}
			</td>
		</a>
	{/each}
</div>

<style>

.directory {
	display: table;
	position: relative;
	overflow: hidden;
	margin: 8px auto 16px auto;
	text-align: left;
	background: var(--body_color);
	border-collapse: collapse;
	border-radius: 8px;

	max-width: 100%;
	width: 1000px;
}
.directory > * {
	display: table-row;
}
.directory > * > * {
	display: table-cell;
}
.node {
	display: table-row;
	text-decoration: none;
	color: var(--text-color);
	padding: 6px;
}
.node:not(:last-child) {
	border-bottom: 1px solid var(--separator);
}
.node:hover:not(.node_selected) {
	background: var(--input_background);
	color: var(--input_text);
	text-decoration: none;
}
.node.node_selected {
	background-color: var(--highlight_color) !important;
	color: var(--highlight_text_color);
}
td {
	padding: 4px;
	vertical-align: middle;
}
.node_icon {
	height: 32px;
	width: 32px;
	vertical-align: middle;
}
.node_name {
	width: 100%;
	overflow: hidden;
	line-height: 1.2em;
	word-break: break-all;
}
.node_size {
	min-width: 50px;
	white-space: nowrap;
}
.hidden {
	display: none;
}
</style>
