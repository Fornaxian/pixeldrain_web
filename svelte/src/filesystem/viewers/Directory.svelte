<script>
import { createEventDispatcher } from 'svelte'
let dispatch = createEventDispatcher()

export let node;

const navigate_to = (path) => {
	dispatch("navigate", path)
}
const navigate_up = () => {
	if (node.parents.length !== 0) {
		navigate_to(node.parents[node.parents.length-1].path)
	}
}

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

<div class="container">
	<div class="toolbar">
		<button on:click={navigate_up}><i class="icon">arrow_upward</i> up</button>
	</div>
	<br/>
	<div class="directory">
		{#if Array.isArray(node.base.children)}
			{#each node.base.children as child}
			<div on:click={navigate_to(child.path)} class="node">
				<img src={node_icon(child)} alt="icon"/>
				<div>{child.name}</div>
			</div>
			{/each}
		{/if}
	</div>
</div>

<style>
.container {
	height: 100%;
	width: 100%;
	padding: 0;
	overflow-y: auto;
	text-align: center;
}
.toolbar {
	position: relative;
	display: inline-block;
	max-width: 800px;
	width: 100%;
	margin: 20px 0 0 0;
	box-sizing: border-box;
}
.directory {
	position: relative;
	display: inline-block;
	max-width: 800px;
	width: 100%;
	margin: 20px 0 40px 0;
	text-align: left;
	background-color: var(--layer_2_color);
	box-shadow: 1px 1px var(--layer_2_shadow) var(--shadow_color);
	box-sizing: border-box;
}
.node {
	position: relative;
	height: 40px;
	overflow: hidden;
	margin: 4px;
	padding: 4px;
	box-sizing: border-box;
	cursor: pointer;
}
.node:hover:not(.node_selected) {
	background-color: var(--input_color_dark);
	color: var(--input_text_color);
	text-decoration: none;
}
/* .node_selected {
	background-color: var(--highlight_color);
	color: var(--highlight_text_color);
} */
.node > div {
	height: 100%;
	overflow: hidden;
	padding: 0;
	line-height: 32px;
	box-sizing: border-box;
	display: inline-block;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.node > img {
	max-height: 100%;
	margin-right: 6px;
	width: auto;
	min-width: auto;
	float: left;
	display: block;
}
</style>
