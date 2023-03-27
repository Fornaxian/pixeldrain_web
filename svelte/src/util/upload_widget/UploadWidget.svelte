<script>
import { createEventDispatcher, tick } from "svelte";
import { fade } from "svelte/transition";
import DropUpload from "./DropUpload.svelte";
import UploadProgress from "./UploadProgress.svelte";
let dispatch = createEventDispatcher()


let file_input_field;
let file_input_change = e => {
	// Start uploading the files async
	upload_files(e.target.files)

	// This resets the file input field
	file_input_field.nodeValue = ""
}
export const pick_files = () => {
	file_input_field.click()
}

export let drop_upload = false
let visible = false
let upload_queue = [];
let task_id_counter = 0

export const upload_files = async (files) => {
	if (files.length === 0) {
		return
	}

	// Add files to the queue
	for (let i = 0; i < files.length; i++) {
		if (files[i].type === "" && files[i].size === 0) {
			continue
		}

		upload_queue.push({
			task_id: task_id_counter,
			file: files[i],
			name: files[i].name,
			component: null,
			id: "",
			status: "queued",
			total_size: files[i].size,
			loaded_size: 0,
		})
		task_id_counter++
	}

	// Reassign array and wait for tick to complete. After the tick is completed
	// each upload progress bar will have bound itself to its array item
	upload_queue = upload_queue
	visible = true
	await tick()

	start_upload()
}

let active_uploads = 0
let state = "idle"

const start_upload = () => {
	for (let i = 0; i < upload_queue.length && active_uploads < 3; i++) {
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

		let file_ids = []
		upload_queue.forEach(job => {
			if (job.status === "finished" && job.id !== "") {
				file_ids.push(job.id)
			}
		})

		dispatch("uploads_finished", file_ids)

		upload_queue = []
		visible = false
	} else {
		state = "uploading"
	}

}

const finish_upload = (e) => {
	active_uploads--
	upload_queue = upload_queue
	start_upload()
}

const leave_confirmation = e => {
	if (state === "uploading") {
		e.preventDefault()
		e.returnValue = "If you close this page your files will stop uploading. Do you want to continue?"
		return e.returnValue
	} else {
		return null
	}
}
</script>

<svelte:window on:beforeunload={leave_confirmation} />

<input
	bind:this={file_input_field}
	on:change={file_input_change}
	class="upload_input" type="file" name="file" multiple="multiple"
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

{#if drop_upload}
	<DropUpload on:upload={e => upload_files(e.detail)}/>
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
	border-radius: 20px 20px 8px 8px;
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
