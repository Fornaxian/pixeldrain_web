<script>
import { createEventDispatcher } from "svelte"
import { swipe_nav } from "./SwipeNavigate.svelte";
let dispatch = createEventDispatcher()

export const set_file = f => {
	file = f
	dispatch("loading", true)
}
let file = {
	id: "",
	name: "",
	mime_type: "",
	get_href: "",
}
export let is_list = false

let container
let zoom = false
let x, y = 0
let dragging = false

// For some reason the dblclick event is firing twice during testing.. So here's
// an event debouncer
let last_dblclick = 0
const double_click = e => {
	let now = Date.now()
	if (now - last_dblclick > 500) {
		zoom = !zoom
	}
	last_dblclick = now
}

const mousedown = (e) => {
	if (!dragging && e.which === 1 && zoom) {
		x = e.pageX
		y = e.pageY
		dragging = true

		e.preventDefault()
		e.stopPropagation()
		return false
	}
}
const mousemove = (e) => {
	if (dragging) {
		container.scrollLeft = container.scrollLeft - (e.pageX - x)
		container.scrollTop  = container.scrollTop  - (e.pageY - y)

		x = e.pageX
		y = e.pageY

		e.preventDefault()
		e.stopPropagation()
		return false
	}
}
const mouseup = (e) => {
	if (dragging) {
		dragging = false

		e.preventDefault()
		e.stopPropagation()
		return false
	}
}

let swipe_style = ""
const on_load = () => {
	dispatch("loading", false)
	swipe_style = ""
}
</script>

<svelte:window on:mousemove={mousemove} on:mouseup={mouseup} />

<div
	bind:this={container}
	class="container"
	class:zoom
	use:swipe_nav={!zoom && is_list}
	on:style={e => swipe_style = e.detail}
	on:prev
	on:next
>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img
		on:load={on_load}
		on:error={on_load}
		on:dblclick={double_click}
		on:doubletap={double_click}
		on:mousedown={mousedown}
		class="image"
		class:zoom
		style={swipe_style}
		src={file.get_href}
		alt={file.name} />
</div>

<style>
.container {
	display: flex;
	justify-content: center;
	height: 100%;
	width: 100%;
	overflow: hidden;
}
.container.zoom {
	overflow: auto;
	justify-content: unset;
}
.image {
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	cursor: pointer;
}
.image.zoom {
	max-width: none;
	max-height: none;
	cursor: move;
}
</style>
