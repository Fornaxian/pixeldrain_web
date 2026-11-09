<script lang="ts">
import { swipe_nav } from "lib/SwipeNavigate";

export const set_file = f => {
	file = f
	on_loading(true)
}
let file = $state({
	id: "",
	name: "",
	mime_type: "",
	get_href: "",
})
let { is_list = false, on_loading, on_prev, on_next }: {
	is_list?: boolean;
	on_loading: (loading: boolean) => void;
	on_prev: () => void;
	on_next: () => void;
} = $props();

let container: HTMLDivElement = $state()
let zoom = $state(false)
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

const on_load = () => on_loading(false)
</script>

<svelte:window onmousemove={mousemove} onmouseup={mouseup} />

<div
	bind:this={container}
	class="container"
	class:zoom
	use:swipe_nav={{
		enabled: !zoom && is_list,
		prev: true,
		next: true,
		on_prev: on_prev,
		on_next: on_next,
	}}
>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<img
		onload={on_load}
		onerror={on_load}
		ondblclick={double_click}
		onmousedown={mousedown}
		class="image"
		class:zoom
		src={file.get_href}
		alt={file.name}
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
}
.image.zoom {
	max-width: none;
	max-height: none;
	cursor: move;
}
</style>
