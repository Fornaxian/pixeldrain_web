<script>
import { createEventDispatcher, onMount } from "svelte";

let dispatch = createEventDispatcher()

export let files = []
let file_list_div
let selected_file_index = 0

onMount(() => {
	// Skip to the file defined in the link hash
	let matches = location.hash.match(new RegExp('item=([^&]*)'))
	let hashID = matches ? matches[1] : null
	let idx = 0
	if (Number.isInteger(parseInt(hashID))) {
		idx = parseInt(hashID)
	}

	set_item(idx)
})

export const next = () => {
	if (shuffle) {
		rand_item()
		return
	}

	set_item(selected_file_index+1)
}
export const prev = () => { set_item(selected_file_index-1) }

let history = []
export const rand_item = () => {
	// Avoid viewing the same file multiple times
	let rand
	do {
		rand = Math.round(Math.random() * files.length)
		console.log("rand is " + rand)
	} while(history.indexOf(rand) > -1)

	set_item(rand)
}

let shuffle = false
export const set_shuffle = s => { shuffle = s }

export const set_item = idx => {
	if (idx >= files.length) {
		idx = 0
	} else if (idx < 0) {
		idx = files.length - 1
	}

	// Remove the class from the previous selected file
	files[selected_file_index].selected = false
	selected_file_index = idx
	files[idx].selected = true

	// Update the URL
	location.hash = "item=" + idx

	// Add item to history
	if(history.length >= (files.length - 6)){
		history.shift()
	}
	history.push(idx)

	dispatch("set_file", files[idx])

	// Smoothly scroll the navigator to the correct element
	let selected_file = file_list_div.children[idx]
	let cst = window.getComputedStyle(selected_file)
	let itemWidth = selected_file.offsetWidth + parseInt(cst.marginLeft) + parseInt(cst.marginRight)

	let start = file_list_div.scrollLeft
	let end = ((idx * itemWidth) + (itemWidth / 2)) - (file_list_div.clientWidth / 2)
	let steps = 60 // One second
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

<div bind:this={file_list_div} class="list_navigator">
	{#each files as file, index}
		<div class="list_item file_button" class:file_button_selected={file.selected} on:click={() => { set_item(index) }}>
			<img src={file.icon_href+"?width=48&height=48"} alt={file.name} class="list_item_thumbnail" />
			{file.name}
		</div>
	{/each}
</div>

<style>
.list_item {
	height: 2.6em !important;
	width: 220px !important;
}
.list_navigator {
	flex-grow: 0;
	flex-shrink: 0;
	position: relative;
	width: 100%;
	border-top: 1px solid var(--layer_2_color_border);
	text-align: center;
	line-height: 1em;
	overflow-x: auto;
	overflow-y: hidden;
	z-index: 50;
	white-space: nowrap;
}
</style>
