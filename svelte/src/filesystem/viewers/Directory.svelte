<script>
import { formatDataVolume } from '../../util/Formatting.svelte'
import { createEventDispatcher } from 'svelte'
let dispatch = createEventDispatcher()

export let node;
export let path_base;
let mode = "viewing"

$: children = node.base.children.reduce((accum, val) => {
	val["selected"] = false
	accum.push(val)
	return accum
}, [])

const node_click = (node, index) => {
	if (mode === "viewing") {
		dispatch("navigate", node.path)
	} else if (mode === "selecting") {
		children[index].selected = !children[index].selected
	}
}
const navigate_up = () => {
	// Go to the path of the last parent
	if (node.parents.length !== 0) {
		dispatch("navigate", node.parents[node.parents.length-1].path)
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
	<div class="width_container">
		<div class="toolbar">
			<!-- {#if node.parents.length !== 0} -->
			<button on:click={navigate_up} class:hidden={node.parents.length === 0}><i class="icon">arrow_back</i></button>
			<!-- {/if} -->
			<div class="toolbar_spacer"></div>
			<button on:click={navigate_up}><i class="icon">cloud_upload</i></button>
			<button on:click={navigate_up}><i class="icon">create_new_folder</i></button>
			<button on:click={navigate_up}><i class="icon">delete</i></button>
		</div>
		<br/>
		<table class="directory">
			<tr>
				<!-- <td><input type="checkbox" /></td> -->
				<td></td>
				<td>name</td>
				<td>size</td>
			</tr>
			{#each children as child, index}
				<a
					href={path_base+child.path}
					on:click|preventDefault={() => {node_click(child, index)}}
					class="node"
					class:node_selected={child.selected}>
					<!-- <td on:click|preventDefault class="node_checkbox">
						<input type="checkbox" />
					</td> -->
					<td>
						<img src={node_icon(child)} class="node_icon" alt="icon"/>
					</td>
					<td class="node_name">
						{child.name}
					</td>
					<td class="node_size">
						{formatDataVolume(child.file_size, 3)}
					</td>
				</a>
			{/each}
		</table>
	</div>
</div>

<style>
.hidden { visibility: hidden; }
.container {
	height: 100%;
	width: 100%;
	padding: 0;
	overflow-y: auto;
	text-align: center;
}
.width_container {
	position: relative;
	display: inline-block;
	max-width: 94%;
	width: 1000px;
	margin: 0;
	padding: 0;
}
.toolbar {
	position: relative;
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	margin: 16px 0 0 0;
	padding: 0;
	box-sizing: border-box;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }

.directory {
	position: relative;
	overflow-x: auto;
	overflow-y: hidden;
	width: 100%;
	margin: 16px 0 16px 0;
	text-align: left;
	background-color: var(--layer_2_color);
	box-shadow: 1px 1px var(--layer_2_shadow) var(--shadow_color);
	box-sizing: border-box;
}
.node {
	display: table-row;
	text-decoration: none;
	color: var(--text-color);
	padding: 6px;
	box-sizing: border-box;
}
.node:not(:last-child) {
	border-bottom: 1px solid var(--layer_3_color);
}
.node:hover:not(.node_selected) {
	background-color: var(--input_color_dark);
	color: var(--input_text_color);
	text-decoration: none;
}
.node.node_selected {
	background-color: var(--highlight_color);
	color: var(--highlight_text_color);
}
td {
	padding: 4px;
	vertical-align: middle;
}
.node_icon {
	height: 32px;
	width: auto;
	vertical-align: middle;
}
.node_name {
	width: 100%;
	overflow: hidden;
	line-height: 1.2em;
}
.node_size {
	min-width: 50px;
	white-space: nowrap;
}
</style>
