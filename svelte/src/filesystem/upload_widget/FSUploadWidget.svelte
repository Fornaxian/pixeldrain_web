<script lang="ts" context="module">
export type UploadJob = {
	task_id: number,
	file: File,
	path: string,
	component: UploadProgress,
	status: string,
	total_size: number,
	loaded_size: number,
};
</script>
<script lang="ts">
import { tick } from "svelte";
import { fade } from "svelte/transition";
import UploadProgress from "./UploadProgress.svelte";
import type { FSNavigator } from "filesystem/FSNavigator";

export let nav: FSNavigator

const max_concurrent_uploads = 5

let file_input_field: HTMLInputElement
let file_input_change = (e: Event) => {
	// Start uploading the files async
	upload_files((e.target as HTMLInputElement).files)

	// This resets the file input field
	file_input_field.nodeValue = ""
}
export const pick_files = () => {
	file_input_field.click()
}

let visible = false
let upload_queue: UploadJob[] = [];
let task_id_counter = 0

export const upload_files = async (files: File[]|FileList) => {
	if (files.length === 0) {
		return
	} else if (nav.base.type !== "dir") {
		alert("Can only upload to directory")
		return
	}

	// Add files to the queue
	for (let i = 0; i < files.length; i++) {
		await upload_file(files[i])
	}
}

export const upload_file = async (file: File) => {
	if (nav.base.type !== "dir") {
		alert("Can only upload to directory")
		return
	} else if (file.type === "" && file.size === 0) {
		return
	}

	let path = nav.base.path + "/"
	if (file.webkitRelativePath) {
		path += file.webkitRelativePath
	} else {
		path += file.name
	}

	upload_queue.push({
		task_id: task_id_counter,
		file: file,
		path: path,
		component: null,
		status: "queued",
		total_size: file.size,
		loaded_size: 0,
	})
	task_id_counter++

	// Reassign array and wait for tick to complete. After the tick is completed
	// each upload progress bar will have bound itself to its array item
	upload_queue = upload_queue

	if (active_uploads === 0 && state !== "uploading") {
		state = "uploading"
		visible = true
		await tick()
		await start_upload()
	}
}

let active_uploads = 0
let state = "idle"

const start_upload = async () => {
	// Count the number of active uploads so we can know how many new uploads we
	// can start
	active_uploads = upload_queue.reduce((acc, val) => {
		if (val.status === "uploading") {
			acc++
		}
		return acc
	}, 0)

	for (let i = 0; i < upload_queue.length && active_uploads < max_concurrent_uploads; i++) {
		if (upload_queue[i]) {
			if (upload_queue[i].status === "queued") {
				active_uploads++
				upload_queue[i].component.start()
				upload_queue[i].status = "uploading"
			}
		}
	}

	if (active_uploads === 0) {
		state = "finished"
		nav.reload()

		// Empty the queue to free any references to lingering components
		upload_queue = []

		// In ten seconds we close the popup
		setTimeout(() => {
			if (state === "finished") {
				visible = false
			}
		}, 10000)
	} else {
		state = "uploading"
	}
}

const finish_upload = () => {
	// Update the queue so the status updates are properly rendered
	upload_queue = upload_queue
	start_upload()
}

const leave_confirmation = (e: BeforeUnloadEvent) => {
	if (state === "uploading") {
		e.preventDefault()
		return "If you close this page your files will stop uploading. Do you want to continue?"
	} else {
		return null
	}
}
</script>

<svelte:window on:beforeunload={leave_confirmation} />

<input
	bind:this={file_input_field}
	on:change={file_input_change}
	class="upload_input" type="file" name="file" multiple
/>

{#if visible}
	<div class="upload_widget" transition:fade={{duration: 200}}>
		<div class="header">
			{#if state === "idle"}
				Waiting for files
			{:else if state === "uploading"}
				Uploading files...
			{:else if state === "finished"}
				Done
			{/if}
		</div>
		<div class="body">
			{#each upload_queue as job}
				{#if job.status !== "finished"}
					<UploadProgress bind:this={job.component} job={job} on:finished={finish_upload}/>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<style>
.upload_input {
	visibility: hidden;
	position: fixed;
	width: 0;
	height: 0;
}
.upload_widget {
	position: fixed;
	display: flex;
	flex-direction: column;
	width: 500px;
	max-width: 80%;
	height: auto;
	max-height: 50%;
	right: 20px;
	bottom: 20px;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 1px 1px 8px var(--shadow_color);
}

.header {
	flex: 0 0 auto;
	background: var(--background_color);
	color: var(--background_text_color);
	text-align: center;
	font-size: 1.2em;
	padding: 4px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.body {
	flex: 1 1 auto;
	background: var(--body_color);
	color: var(--body_text_color);
	overflow-y: auto;
	text-align: left;
}
</style>
