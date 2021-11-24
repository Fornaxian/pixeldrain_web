<script>
import { createEventDispatcher } from "svelte";
let dispatch = createEventDispatcher()

export let list = {
	id: "",
	title: "",
	files: [],
	download_href: "",
	info_href: "",
	can_edit: false,
}

const click_file = index => {
	dispatch("set_file", index)
}

const delete_file = async index => {
	dispatch("loading", true)

	let listjson = {
		title: list.title,
		files: [],
	}
	list.files.forEach((f, idx) => {
		if (idx !== index) {
			listjson.files.push({
				id: f.id,
			})
		}
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
		dispatch("reload")
	}
}
</script>

<div class="gallery">
	{#each list.files as file, index}
		<div class="file" on:click={() => {click_file(index)}}>
			<div
				class="icon_container"
				class:editing={list.can_edit}
				style="background-image: url('{file.icon_href}?width=256&height=256');">
				{#if list.can_edit}
					<!-- <i class="icon" style="cursor: grab;">drag_indicator</i>
					<i class="icon">chevron_left</i>
					<i class="icon">chevron_right</i> -->
					<i class="icon" on:click|stopPropagation={() => {delete_file(index)}}>delete</i>
				{/if}
			</div>
			{file.name}
		</div>
	{/each}

	<!-- {#if list.can_edit}
		<div class="file" style="font-size: 1.5em; padding-top: 2.5em; cursor: pointer;">
			<i class="icon">add</i>
			<br/>
			Add files
		</div>
	{/if} -->
</div>

<style>
.gallery{
	padding: 16px;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	overflow: auto;
}
.file{
	position: relative;
	box-sizing: border-box;
	width: 200px;
	max-width: 90%;
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
.file:hover {
	box-shadow: 0 0 2px 2px var(--highlight_color);
	text-decoration: none;
}
.icon_container {
	width: 100%;
	height: 136px;
	background-position: center;
	background-size: cover;
	font-size: 20px;
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
