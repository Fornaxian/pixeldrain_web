<script lang="ts">
import { createEventDispatcher } from "svelte";
import { swipe_nav } from "lib/SwipeNavigate.mjs";
import { fs_path_url } from "filesystem/FilesystemAPI.mjs";

let dispatch = createEventDispatcher();

export let nav
let container
let zoom = false
let x = 0, y = 0
let dragging = false
let swipe_prev = true
let swipe_next = true

export const update = async () => {
	dispatch("loading", true)

	// Figure out if there are previous or next files. If not then we disable
	// swiping controls in that direction
	const siblings = await nav.get_siblings()
	for (let i = 0; i < siblings.length; i++) {
		if (siblings[i].name === nav.base.name) {
			swipe_prev = i > 0
			swipe_next = i < siblings.length-1
			break
		}
	}
}

const on_load = () => dispatch("loading", false)

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

<div
	bind:this={container}
	class="container"
	class:zoom
	use:swipe_nav={{enabled: !zoom, prev: swipe_prev, next: swipe_next}}
	on:prev={() => nav.open_sibling(-1)}
	on:next={() => nav.open_sibling(1)}
>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img
		on:dblclick={() => {zoom = !zoom}}
		on:mousedown={mousedown}
		on:load={on_load}
		on:error={on_load}
		class="image"
		class:zoom
		src={fs_path_url($nav.base.path)}
		alt="no description available"
	/>
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
	box-shadow: 1px 1px 4px 0px var(--shadow_color);
}
.image.zoom {
	max-width: none;
	max-height: none;
	cursor: move;
}
</style>
