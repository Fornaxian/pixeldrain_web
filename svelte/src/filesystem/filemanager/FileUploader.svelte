<script>
import { createEventDispatcher } from "svelte";
let dispatch = createEventDispatcher()

export let bucket_id
export let target_dir

let upload_jobs = []
let upload_threads = 0
let max_upload_threads = 4

// Adds files to the upload queue. The file_list parameter needs to be of type
// FileList. Upload will also create the necessary directories to place nested
// files in.
export const upload = (file_list) => {
	for (let i = 0; i < file_list.length; i++) {
		upload_jobs.push({
			file: file_list[i],
			progress: 0,
			target_dir: target_dir.valueOf(),
			uploading: false,
			finished: false,
			tries: 0,
		})
	}

	// This updates the UI
	upload_jobs = upload_jobs

	while (upload_threads <= max_upload_threads) {
		upload_threads++
		setTimeout(upload_file, 1)
	}
}

const uploads_finished = () => {
	dispatch("finished")
}

const upload_file = () => {
	let job = null
	for (let i = 0; i < upload_jobs.length; i++) {
		// If a file is done we remove it from the array
		if (upload_jobs[i].progress >= 1) {
			upload_jobs.splice(i, 1)
			continue
		}

		if (upload_jobs[i].uploading === false && upload_jobs[i].finished === false) {
			job = upload_jobs[i]
			job.uploading = true
			upload_jobs = upload_jobs
			break
		}
	}
	if (job === null) {
		upload_threads--

		if (upload_threads === 0) {
			uploads_finished()
		}
		return
	}

	console.log(job)

	let form = new FormData();
	form.append("type", "file")
	form.append("file", job.file)

	let xhr = new XMLHttpRequest();
	xhr.open(
		"POST",
		"/api/filesystem/"+bucket_id+encodeURIComponent(
			job.target_dir+"/"+job.file.name,
		),
		true,
	);
	xhr.timeout = 21600000; // 6 hours, to account for slow connections

	// Report progress updates back to the caller
	xhr.upload.addEventListener("progress", evt => {
		if (evt.lengthComputable) {
			job.progress = evt.loaded / evt.total
			upload_jobs = upload_jobs
		}
	});

	xhr.onreadystatechange = () => {
		// readystate 4 means the upload is done
		if (xhr.readyState !== 4) { return; }

		if (xhr.status >= 100 && xhr.status < 400) {
			// Request is a success

			// Finish the upload job
			job.uploading = false
			job.finished = true
			upload_file()
		} else if (xhr.status >= 400) {
			// Request failed
			console.log("Upload error. status: " + xhr.status + " response: " + xhr.response);
			let resp = JSON.parse(xhr.response);
			if (job.tries === 3) { // Upload failed
				return
			} else { // Try again
				job.tries++;
				job.uploading = false
				job.finished = false
			}

			// Sleep the upload thread for 5 seconds
			setTimeout(upload_file, 5000);
		} else {
			// Request did not arrive
			if (job.tries === 3) { // Upload failed
				alert("upload failed "+xhr.responseText)
				job.uploading = false
				job.finished = false
			} else { // Try again
				job.tries++;
			}

			// Sleep the upload thread for 5 seconds
			setTimeout(upload_file, 5000);
		}

		upload_jobs = upload_jobs
	};
	xhr.send(form);
}

// File input dialog handling
let file_input
export const picker = () => { file_input.click() }
const file_input_change = e => {
	upload(e.target.files)
	file_input.nodeValue = ""
}

// Drag and drop upload
let hidden = true
const dragover = e => { hidden = false }
const dragleave = e => { hidden = true }
const drop = e => {
	hidden = true
	upload(e.dataTransfer.files)
}
const paste = e => {
	if (e.clipboardData.files[0]) {
		e.preventDefault()
		e.stopPropagation()
		console.log(e.clipboardData.files[0].getAsFile())
	}
}

</script>

<svelte:body
	on:dragover|preventDefault|stopPropagation={dragover}
	on:dragleave|preventDefault|stopPropagation={dragleave}
	on:drop|preventDefault|stopPropagation={drop}
	on:paste={paste}
/>

<div>
	<input class="file_input" bind:this={file_input} on:change={file_input_change} type="file" multiple="multiple"/>
	<div class:hidden class="highlight_green">
		Drop files here to upload them
	</div>

	{#each upload_jobs as c}
		<div class="file_upload">
			&nbsp;{c.file.name}&nbsp;<br/>
			<div class="upload_progress_bar">
				<div class="upload_progress" style="width: {c.progress*100}%"></div>
			</div>
		</div>
	{/each}
</div>

<style>
.hidden {display: none;}

.file_input {
	display: block;
	visibility: hidden;
	width: 0;
	height: 0;
}

.file_upload {
	display: block;
	text-align: left;
	width: 100%;
	margin: 6px 0 0 0;
	padding: 0;
	background-color: var(--layer_2_color);
	box-shadow: 1px 1px var(--layer_2_shadow) var(--shadow_color);
}

.upload_progress_bar {
	width: 100%;
	height: 2px;
}
.upload_progress {
	background-color: var(--highlight_color);
	height: 100%;
}
</style>
