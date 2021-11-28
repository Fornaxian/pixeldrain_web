<script>
import { createEventDispatcher } from "svelte";

let dispatch = createEventDispatcher()

export let files = []
let file_list_div
let selected_file_index = 0

export const next = () => {
	if (shuffle) {
		rand_item()
		return
	}

	select_item_event(selected_file_index+1)
}
export const prev = () => {
	select_item_event(selected_file_index-1)
}

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

export let shuffle = false

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

// select_item signals to the FileViewer that the file needs to be changed. The
// FileViewer then calls set_item if the change has been approved. ListNavigator
// cannot call set_item itself because it will cause a loop.
const select_item_event = idx => {
	dispatch("set_file", idx)
}
</script>

<div class="nav_container">
	<button class="nav_button" style="margin-right: 0;" on:click={prev}>
		<i class="icon">chevron_left</i>
	</button>
	<div bind:this={file_list_div} class="list_navigator">
		{#each files as file, index}
			<div class="list_item file_button"
				class:file_button_selected={file.selected}
				on:click={() => { select_item_event(index) }}>
				<img src={file.icon_href+"?width=48&height=48"} alt={file.name} class="list_item_thumbnail" loading="lazy"/>
				{file.name}
			</div>
		{/each}
	</div>
	<button class="nav_button" style="margin-left: 0;" on:click={next}>
		<i class="icon">chevron_right</i>
	</button>
</div>

<style>
.nav_container{
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	position: relative;
	width: 100%;
	border-top: 1px solid var(--layer_2_color_border);
	text-align: center;
	line-height: 1em;

}
.nav_button{
	flex-grow: 0;
	flex-shrink: 0;
	height: 2.6em;
	margin-top: 8px;
}

.list_item {
	height: 2.6em !important;
	width: 220px !important;
}
.list_navigator {
	flex-grow: 1;
	flex-shrink: 1;
	overflow-x: auto;
	overflow-y: hidden;
	white-space: nowrap;
}
</style>
