<script>
import { createEventDispatcher } from "svelte"
import { flip } from "svelte/animate"
import FilePicker from "./FilePicker.svelte"
import { file_type } from "./FileUtilities.svelte";
let dispatch = createEventDispatcher()

export let list = {
	id: "",
	title: "",
	files: [],
	download_href: "",
	info_href: "",
	can_edit: false,
}

let file_picker;

const update_list = async new_files => {
	dispatch("loading", true)

	// If the list is empty we simply delete it
	if (list.files.length === 0) {
		try {
			let resp = await fetch(list.info_href, {method: "DELETE"})
			if (resp.status >= 400) {
				throw (await resp.json()).message
			}
			window.close()
		} catch (err) {
			alert("Failed to delete album: "+err)
		} finally {
			dispatch("loading", false)
		}
		return
	}

	let listjson = {
		title: list.title,
		files: [],
	}
	list.files.forEach(f => {
		listjson.files.push({
			id: f.id,
		})
	})

	try {
		const resp = await fetch(
			list.info_href,
			{ method: "PUT", body: JSON.stringify(listjson) },
			);
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}
	} catch (err) {
		alert("Failed to update album: "+err)
	} finally {
		dispatch("loading", false)
	}
}

const add_files = async files => {
	let list_files = list.files;
	files.forEach(f => {
		list_files.push(f)
	})
	await update_list(list_files)
	dispatch("reload")
}

const delete_file = async index => {
	let list_files = list.files
	list_files.splice(index, 1)
	await update_list(list_files)
	list.files = list_files
}

const move_left = async index => {
	if (index === 0) {
		return;
	}
	let f = list.files;
	[f[index], f[index-1]] = [f[index-1], f[index]];
	await update_list(f)
	list.files = f
}
const move_right = async index => {
	if (index >= list.files.length-1) {
		return;
	}
	let f = list.files;
	[f[index], f[index+1]] = [f[index+1], f[index]];
	await update_list(f)
	list.files = f
}

let hovering = -1
const drag = (e, index) => {
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.dropEffect = 'move';
	e.dataTransfer.setData('text/plain', index);
}
const drop = (e, index) => {
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

	update_list(list_files)
}
</script>

<div class="gallery">
	{#each list.files as file, index (file)}
		<a
			href="#item={index}"
			class="file"
			draggable={list.can_edit}
			on:dragstart={e => drag(e, index)}
			on:drop|preventDefault={e => drop(e, index)}
			on:dragover|preventDefault|stopPropagation
			on:dragenter={() => {hovering = index}}
			on:dragend={() => {hovering = -1}}
			class:highlight={hovering === index}
			animate:flip={{duration: 500}}>
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
			</div>
			{file.name}
		</a>
	{/each}

	{#if list.can_edit}
		<button class="file" on:click={file_picker.open} style="font-size: 1.5em; cursor: pointer;">
			<i class="icon">add</i>
			<br/>
			Add files
		</button>
	{/if}
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
}
.file:hover {
	background: var(--input_hover_background);
}

.highlight {
	box-shadow: 0 0 0px 2px var(--highlight_color);
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
</style>
