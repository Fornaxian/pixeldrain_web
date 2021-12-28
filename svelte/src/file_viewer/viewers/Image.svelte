<script>
import { createEventDispatcher } from "svelte"
let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	id: "",
	name: "",
	mime_type: "",
	get_href: "",
}

let container
let zoom = false
let x, y = 0
let dragging = false

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
</script>

<svelte:window on:mousemove={mousemove} on:mouseup={mouseup} />

<div bind:this={container} class="container" class:zoom>
	<img
		on:loadstart={() => {dispatch("loading", true)}}
		on:load={() => {dispatch("loading", false)}}
		on:error={() => {dispatch("loading", false)}}
		on:dblclick={() => {zoom = !zoom}}
		on:doubletap={() => {zoom = !zoom}}
		on:mousedown={mousedown}
		class="image" class:zoom
		src={file.get_href}
		alt={file.name} />
</div>

<style>
.container {
	position: relative;
	display: block;
	height: 100%;
	width: 100%;
	text-align: center;
	overflow: hidden;
}
.container.zoom {
	overflow: auto;
}
.image {
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	top: 50%;
	cursor: pointer;
	transform: translateY(-50%);
	box-shadow: 1px 1px 5px var(--shadow_color);
}
.image.zoom {
	max-width: none;
	max-height: none;
	top: 0;
	cursor: move;
	transform: none;
}
</style>
