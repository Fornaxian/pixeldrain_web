<script>
import { createEventDispatcher } from "svelte"
import { flip } from "svelte/animate"
import FilePicker from "./FilePicker.svelte"
import { file_type } from "./FileUtilities.svelte";
import { get_video_position } from "lib/VideoPosition.mjs"
import ProgressBar from "util/ProgressBar.svelte"
let dispatch = createEventDispatcher()

export let list = {
	files: [],
	can_edit: false,
}

let file_picker;

const add_files = async files => {
	let list_files = list.files;
	files.forEach(f => {
		list_files.push(f)
	})

	dispatch("update_list", list_files)
}

const delete_file = async index => {
	let list_files = list.files
	list_files.splice(index, 1)

	list.files = list_files // Update the view (and play animation)
	dispatch("update_list", list_files)
}

const move_left = async index => {
	if (index === 0) {
		return;
	}
	let f = list.files;
	[f[index], f[index-1]] = [f[index-1], f[index]];

	list.files = f // Update the view (and play animation)
	dispatch("update_list", f)
}
const move_right = async index => {
	if (index >= list.files.length-1) {
		return;
	}
	let f = list.files;
	[f[index], f[index+1]] = [f[index+1], f[index]];

	list.files = f // Update the view (and play animation)
	dispatch("update_list", f)
}

// Index of the file which is being hovered over. -1 is nothing and -2 is the
// Add files button
let hovering = -1
let dragging = false
const drag = (e, index) => {
	dragging = true
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.dropEffect = 'move';
	e.dataTransfer.setData('text/plain', index);
}
const drop = (e, index) => {
	hovering = -1
	dragging = false

	if (e.dataTransfer.files.length !== 0) {
		// This is not a rearrangement, this is a file upload
		dispatch("upload_files", e.dataTransfer.files)
		return
	} else if (index === -2) {
		return
	}

	e.dataTransfer.dropEffect = 'move';
	let start = parseInt(e.dataTransfer.getData("text/plain"));
	let list_files = list.files

	if (start < index) {
		list_files.splice(index + 1, 0, list_files[start]);
		list_files.splice(start, 1);
	} else if (start > index) {
		list_files.splice(index, 0, list_files[start]);
		list_files.splice(start + 1, 1);
	} else {
		return; // Nothing changed
	}

	dispatch("update_list", list_files)
}
</script>

<div class="gallery">
	{#if list.can_edit}
		<div class="add_button"
			on:drop|preventDefault={e => drop(e, -2)}
			on:dragover|preventDefault|stopPropagation
			on:dragenter={() => hovering = -2}
			on:dragend={() => {hovering = -1}}
			class:highlight={!dragging && hovering === -2}
			role="listitem"
		>
			<button class="add_button_part" on:click={e => dispatch("pick_files")}>
				<i class="icon">cloud_upload</i>
				Upload files
			</button>
			<button class="add_button_part" on:click={file_picker.open}>
				<i class="icon">add</i>
				Add files
			</button>
		</div>
	{/if}

	{#each list.files as file, index (file)}
		{@const vp = get_video_position(file.id)}
		<a
			href="#item={index}"
			class="file"
			draggable={list.can_edit}
			on:dragstart={e => drag(e, index)}
			on:drop|preventDefault={e => drop(e, index)}
			on:dragover|preventDefault|stopPropagation
			on:dragenter={() => hovering = index}
			on:dragend={() => {hovering = -1; dragging = false}}
			class:highlight={dragging && hovering === index}
			animate:flip={{duration: 400}}>
			<div
				class="icon_container"
				class:editing={list.can_edit}
				class:wide={file_type(file) === "image" || file_type(file) === "video"}
				style="background-image: url('{file.icon_href}?width=256&height=256');">
				{#if list.can_edit}
					<div class="button_row">
						<i class="icon" style="cursor: grab;">
							drag_indicator
						</i>
						<div class="separator"></div>
						<button class="icon" on:click|stopPropagation|preventDefault={() => {move_left(index)}}>
							chevron_left
						</button>
						<button class="icon" on:click|stopPropagation|preventDefault={() => {move_right(index)}}>
							chevron_right
						</button>
						<button class="icon" on:click|stopPropagation|preventDefault={() => {delete_file(index)}}>
							delete
						</button>
					</div>
				{/if}

				{#if vp !== null}
					<div class="grow"></div>
					<ProgressBar no_margin used={vp.pos} total={vp.dur}/>
				{/if}
			</div>

			{file.name}
		</a>
	{/each}
</div>

<FilePicker
	bind:this={file_picker}
	on:files={e => {add_files(e.detail)}}
	multi_select={true}
	title="Select files to add to album">
</FilePicker>

<style>
.gallery{
	width: 100%;
	max-height: 100%;
	overflow: auto;
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
	transition: background 0.2s, padding 0.2s, box-shadow 0.2s;
	box-shadow: 1px 1px 0px 0px var(--shadow_color);
}
.file:hover {
	background: var(--input_hover_background);
}

.highlight {
	box-shadow: 0 0 0px 2px var(--highlight_color);
	text-decoration: none;
}
.icon_container {
	display: flex;
	flex-direction: column;
	margin: 3px;
	height: 148px;
	border-radius: 6px;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
	font-size: 22px;
	text-align: left;
}
.icon_container.editing {
	box-shadow: inset 0 60px 40px -20px var(--body_color);
}
.icon_container.wide {
	background-size: cover;
}
.button_row {
	display: flex;
	flex-direction: row;
}
.button_row > .icon {
	flex: 0 0 auto;
	color: var(--body_text_color);
}
.button_row > button {
	flex: 0 0 auto;
	padding: 0;
}
.button_row>.separator {
	flex: 1 1 auto;
}
.add_button{
	width: 200px;
	max-width: 42%;
	height: 200px;
	margin: 8px;
	border-radius: 8px;
	background: var(--body_color);
	text-align: center;
	line-height: 1.2em;
	display: inline-block;
	vertical-align: top;
	color: var(--body_text_color);

	display: flex;
	flex-direction: column;
}
.add_button > * {
	flex: 1 1 auto;
	font-size: 1.5em;
	cursor: pointer;
	flex-direction: column;
	justify-content: center;
}
.grow {
	flex: 1 1 auto;
}
</style>
