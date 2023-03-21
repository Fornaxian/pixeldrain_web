<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";

let dispatch = createEventDispatcher()
let dragging = false

const drop = (e) => {
	dragging = false;
	if (e.dataTransfer && e.dataTransfer.items.length > 0) {
		e.preventDefault()
		e.stopPropagation()
		dispatch("upload", e.dataTransfer.files)
	}
}
const paste = (e) => {
	if (e.clipboardData.files.length !== 0) {
		e.preventDefault();
		e.stopPropagation();
		dispatch("upload", e.clipboardData.files)
	}
}
</script>

<svelte:window
	on:dragover|preventDefault|stopPropagation={() => { dragging = true }}
	on:dragenter|preventDefault|stopPropagation={() => { dragging = true }}
	on:dragleave|preventDefault|stopPropagation={() => { dragging = false }}
	on:drop={drop}
	on:paste={paste}
/>

{#if dragging}
	<div class="drag_target" transition:fade={{duration: 200}}>
		Drop files here to upload them
	</div>
{/if}

<style>
.drag_target {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	padding: 50px;
	font-size: 2em;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 100px;
	box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.5);
}
</style>
