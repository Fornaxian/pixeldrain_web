<script>
import { createEventDispatcher } from "svelte";

let dispatch = createEventDispatcher()

export let files = []
export let shuffle = false
let file_list_div
let selected_file_index = 0

export const next = () => {
	if (shuffle) {
		rand_item()
	} else {
		dispatch("set_file", selected_file_index+1)
	}
}
export const prev = () => {
	dispatch("set_file", selected_file_index-1)
}
export const toggle_gallery = () => {
	dispatch("toggle_gallery")
}

let history = []
export const rand_item = () => {
	// Avoid viewing the same file multiple times
	let rand
	do {
		rand = Math.floor(Math.random() * files.length)
		console.log("rand is " + rand)
	} while(history.indexOf(rand) > -1)

	dispatch("set_file", rand)
}

export const set_item = idx => {
	// Remove the class from the previous selected file
	selected_file_index = idx
	files.forEach((f, i) => {
		f.selected = selected_file_index === i
	})
	files = files

	// Add item to history
	if(history.length >= (files.length - 6)){
		history.shift()
	}
	history.push(idx)

	// Smoothly scroll the navigator to the correct element
	let selected_file = file_list_div.children[idx]
	let cst = window.getComputedStyle(selected_file)
	let itemWidth = selected_file.offsetWidth + parseInt(cst.marginLeft) + parseInt(cst.marginRight)

	let start = file_list_div.scrollLeft
	let end = ((idx * itemWidth) + (itemWidth / 2)) - (file_list_div.clientWidth / 2)
	let steps = 30 // One second
	let stepSize = (end - start)/steps

	let animateScroll = (pos, step) => {
		file_list_div.scrollLeft = pos

		if (step < steps) {
			requestAnimationFrame(() => {
				animateScroll(pos+stepSize, step+1)
			})
		}
	}
	animateScroll(start, 0)
}
</script>

<div class="nav_container">
	<button class="nav_button" on:click={toggle_gallery} title="Opens a gallery view of the album">
		<i class="icon">photo_library</i><br/>
		Gallery
	</button>
	<div bind:this={file_list_div} class="list_navigator">
		{#each files as file, index (file)}
			<a
				href="#item={index}"
				title="Open {file.name}"
				class="file_button"
				class:file_selected={file.selected}>
				<img src={file.icon_href+"?width=64&height=64"} alt={file.name} class="list_item_thumbnail" loading="lazy"/>
				{file.name}
			</a>
		{/each}
	</div>
</div>

<style>
.nav_container{
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	position: relative;
	width: 100%;
	border-top: 2px solid var(--separator);
	text-align: center;
	line-height: 1em;

}
.nav_button{
	flex-grow: 0;
	flex-shrink: 0;
	margin: 6px;
}

.list_navigator {
	flex-grow: 1;
	flex-shrink: 1;
	overflow-x: auto;
	overflow-y: hidden;
	white-space: nowrap;
}

.file_button {
	position: relative;
	height: 50px;
	width: 220px;
	margin: 6px;
	padding: 0;
	overflow: hidden;
	border-radius: 6px;
	background: var(--input_background);
	color: var(--body_text_color);
	word-break: break-all;
	text-align: left;
	line-height: 1.2em;
	display: inline-block;
	transition: background 0.2s;
	white-space: normal;
	text-decoration: none;
	vertical-align: top;
	cursor: pointer;
	border-width: 2px;
	border-style: solid;
	border-color: var(--input_background);
}

.file_button:hover {
	text-decoration: none;
	background: var(--input_hover_background);
}

.file_button>img {
	height: 100%;
	margin-right: 5px;
	float: left;
	display: block;
}
.file_selected {
	text-decoration: none;
	border-color: var(--highlight_color);
}
</style>
