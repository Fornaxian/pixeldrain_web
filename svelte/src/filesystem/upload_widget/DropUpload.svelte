<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";

let dispatch = createEventDispatcher()
let dragging = false

const paste = (e) => {
	if (e.clipboardData.files.length !== 0) {
		e.preventDefault();
		e.stopPropagation();
		dispatch("upload", e.clipboardData.files)
	}
}

const can_upload = e => {
	if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
		return true
	}

	for (let i = 0; i < e.dataTransfer.items.length; i++) {
		if (e.dataTransfer.items[i].kind === "file") {
			return true
		}
	}

	return false
}

const dragover = e => {
	if (can_upload(e)) {
		e.stopPropagation();
		e.preventDefault();
		dragging = true
		console.log(e)
	}
}
const dragleave = e => {
	dragging = false
}
const drop = async e => {
	dragging = false;

	if (can_upload(e)) {
		e.stopPropagation();
		e.preventDefault();
	} else {
		return
	}

	// if directory support is available
	if(e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
		for (let i = 0; i < e.dataTransfer.items.length; i++) {
			let entry = await e.dataTransfer.items[i].webkitGetAsEntry();
			if (entry) {
				read_dir_recursive(entry);
			}
		}
	} else if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
		dispatch("upload_files", e.dataTransfer.files)
	}
}

const read_dir_recursive = item => {
	if (item.isDirectory) {
		item.createReader().readEntries(entries => {
			entries.forEach(entry => {
				read_dir_recursive(entry);
			});
		});
	} else {
		item.file(file => {
			dispatch("upload_file", file)
		});
	}
}
</script>

<svelte:window
	on:dragover={dragover}
	on:dragenter={dragover}
	on:dragleave={dragleave}
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
