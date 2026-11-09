<script lang="ts">
import { fade } from "svelte/transition";

let { on_upload }: {
	on_upload: (files: FileList) => void;
} = $props();
let dragging = $state(false)

const drag = (e: DragEvent, active: boolean) => {
	e.preventDefault()
	e.stopPropagation()
	dragging = active
}

const drop = (e) => {
	dragging = false;
	if (e.dataTransfer && e.dataTransfer.items.length > 0) {
		e.preventDefault()
		e.stopPropagation()
		on_upload(e.dataTransfer.files)
	}
}
const paste = (e) => {
	if (e.clipboardData.files.length !== 0) {
		e.preventDefault();
		e.stopPropagation();
		on_upload(e.clipboardData.files)
	}
}
</script>

<svelte:window
	ondragover={e => drag(e, true)}
	ondragenter={e => drag(e, true)}
	ondragleave={e => drag(e, false)}
	ondrop={drop}
	onpaste={paste}
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
