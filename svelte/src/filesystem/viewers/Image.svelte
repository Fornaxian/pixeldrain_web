<script>
import { fs_path_url } from "../FilesystemUtil";


export let state
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
		on:dblclick={() => {zoom = !zoom}}
		on:doubletap={() => {zoom = !zoom}}
		on:mousedown={mousedown}
		class="image" class:zoom
		src={fs_path_url(state.base.path)}
		alt="no description available" />
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
