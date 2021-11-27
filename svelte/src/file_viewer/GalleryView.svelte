<script>
import { createEventDispatcher } from "svelte"
import { flip } from "svelte/animate"
import FilePicker from "./FilePicker.svelte"
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

const click_file = index => {
	dispatch("set_file", index)
}

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
	const list_files = list.files
	list_files.splice(index, 1)
	await update_list(list_files)
	list.files = list_files
}

const move_left = async index => {
	if (index === 0) {
		return;
	}
	const f = list.files;
	[f[index], f[index-1]] = [f[index-1], f[index]];
	await update_list(f)
	list.files = f
}
const move_right = async index => {
	if (index >= list.files.length-1) {
		return;
	}
	const f = list.files;
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
		<div
			class="file"
			on:click={() => {click_file(index)}}
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
				style="background-image: url('{file.icon_href}?width=256&height=256');">
				{#if list.can_edit}
					<i class="icon" on:click|stopPropagation style="cursor: grab;">drag_indicator</i>
					<i class="icon" on:click|stopPropagation={() => {move_left(index)}}>chevron_left</i>
					<i class="icon" on:click|stopPropagation={() => {move_right(index)}}>chevron_right</i>
					<i class="icon" on:click|stopPropagation={() => {delete_file(index)}}>delete</i>
				{/if}
			</div>
			{file.name}
		</div>
	{/each}

	{#if list.can_edit}
		<div class="file" on:click={file_picker.open} style="font-size: 1.5em; padding-top: 2.5em; cursor: pointer;">
			<i class="icon">add</i>
			<br/>
			Add files
		</div>
	{/if}

	<FilePicker bind:this={file_picker} on:files={e => {add_files(e.detail)}}></FilePicker>
</div>

<style>
.gallery{
	padding: 16px;
	width: 100%;
	height: 100%;
	overflow: auto;
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
	box-shadow: 2px 2px 8px 0 var(--shadow_color);
	background-color: var(--layer_3_color);
	word-break: break-all;
	text-align: center;
	line-height: 1.2em;
	display: inline-block;
	text-overflow: ellipsis;
	text-decoration: none;
	vertical-align: top;
}
.file:hover, .highlight {
	box-shadow: 0 0 2px 2px var(--highlight_color);
	text-decoration: none;
}
.icon_container {
	width: 100%;
	height: 136px;
	background-position: center;
	background-size: cover;
	font-size: 22px;
	text-align: left;
}
.icon_container.editing {
	box-shadow: inset 0 60px 40px -40px #000000;
}
.icon_container > i:hover {
	color: var(--highlight_color);
	cursor: pointer;
}
</style>
