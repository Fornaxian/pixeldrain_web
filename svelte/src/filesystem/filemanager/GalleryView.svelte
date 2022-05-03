<script>
import { createEventDispatcher } from "svelte"
let dispatch = createEventDispatcher()

export let state


const node_icon = node => {
	if (node.type === "dir") {
		return "/res/img/mime/folder.png"
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

<div class="gallery">
	{#each state.children as child, index (child.path)}
		<a class="file"
			href={state.path_root+child.path}
			on:click|preventDefault={() => {dispatch("node_click", index)}}
			class:selected={child.fm_selected}
			title={child.name}
		>
			<div
				class="icon_container"
				style="background-image: url('{node_icon(child)}?width=256&height=256');">
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
	position: relative;
	width: 200px;
	max-width: 45%;
	height: 200px;
	margin: 8px;
	padding: 0;
	overflow: hidden;
	border-radius: 8px;
	box-shadow: 1px 1px 3px -1px var(--shadow_color);
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
	width: 100%;
	height: 116px;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
	font-size: 22px;
	text-align: left;
}
</style>
