<script>
import { domain_url } from "../util/Util.svelte"
import { formatDataVolume, formatDuration} from "../util/Formatting.svelte"

export let job = {}
let file_button
let tries = 0
let start_time = 0
let remaining_time = 0

let statsInterval = null
let progress = 0
let last_progress_time = 0
let last_loaded_size = 0
const on_progress = () => {
	if (job.loaded_size === 0 || job.total_size === 0) {
		return
	}

	let now = new Date().getTime()
	progress = job.loaded_size / job.total_size
	let elapsed_time = now - start_time
	remaining_time = (elapsed_time/progress) - elapsed_time

	// Calculate transfer rate
	if (last_progress_time != 0) {
		let new_rate = (1000 / (now - last_progress_time)) * (job.loaded_size - last_loaded_size)

		// Apply smoothing by mixing it with the previous number 10:1
		job.transfer_rate = Math.floor((job.transfer_rate * 0.9) + (new_rate * 0.1))
	}

	last_progress_time = now
	last_loaded_size = job.loaded_size

	file_button.style.background = 'linear-gradient(' +
		'to right, ' +
		'var(--layer_3_color) 0%, ' +
		'var(--highlight_color) ' + (progress * 100) + '%, ' +
		'var(--layer_3_color) ' + ((progress * 100) + 1) + '%)'
}

let href = null
let target = null
const on_success = (resp) => {
	clearInterval(statsInterval)
	job.transfer_rate = 0

	job.id = resp.id
	job.status = "finished"
	job.on_finished(job)

	add_upload_history(resp.id)

	href = "/u/"+resp.id
	target = "_blank"

	file_button.style.background = 'var(--layer_3_color)'
}

let error_id = ""
let error_reason = ""
const on_failure = (status, message) => {
	clearInterval(statsInterval)
	job.transfer_rate = 0
	job.loaded_size = job.total_size

	error_id = status
	error_reason = message
	job.status = "error"
	file_button.style.background = 'var(--danger_color)'
	file_button.style.color = 'var(--highlight_text_color)'

	job.on_finished(job)
}

export const start = () => {
	start_time = new Date().getTime()
	statsInterval = setInterval(on_progress, 50) // 20 FPS, plenty for stats

	let form = new FormData();
	form.append('file', job.file, job.name);

	let xhr = new XMLHttpRequest();
	xhr.open("POST", window.api_endpoint+"/file", true);
	xhr.timeout = 21600000; // 6 hours, to account for slow connections

	xhr.upload.addEventListener("progress", evt => {
		if (evt.lengthComputable) {
			job.loaded_size = evt.loaded
			job.total_size = evt.total
		}
	});

	xhr.onreadystatechange = () => {
		// readystate 4 means the upload is done
		if (xhr.readyState !== 4) {
			return
		}

		if (xhr.status >= 100 && xhr.status < 400) {
			// Request is a success
			on_success(JSON.parse(xhr.response))
		} else if (xhr.status >= 400) {
			// Request failed
			console.log("Upload error. status: " + xhr.status + " response: " + xhr.response);
			let resp = JSON.parse(xhr.response);

			if (resp.value == "file_too_large" || resp.value == "ip_banned" || tries === 3) {
				// Permanent failure
				on_failure(resp.value, resp.message)
			} else {
				// Temporary failure, try again in 5 seconds
				tries++
				setTimeout(start, 5000)
			}
		} else {
			// Request did not arrive
			if (tries < 3) {
				// Try again
				tries++
				setTimeout(start, 5000)
			} else {
				// Give up after three tries
				on_failure(xhr.responseText, xhr.responseText)
			}
		}
	};

	xhr.send(form);
}

const add_upload_history = id => {
	// Make sure the user is not logged in, for privacy. This keeps the
	// files uploaded while logged in and anonymously uploaded files
	// separated
	if (document.cookie.includes("pd_auth_key")) { return; }

	let uploads = localStorage.getItem("uploaded_files");
	if (uploads === null) { uploads = ""; }

	// Check if there are not too many values stored
	if (uploads.length > 3600) {
		// 3600 characters is enough to store 400 file IDs. If we exceed that
		// number we'll drop the last two items
		uploads = uploads.substring(
			uploads.indexOf(",") + 1
		).substring(
			uploads.indexOf(",") + 1
		);
	}

	// Save the new ID
	localStorage.setItem("uploaded_files", id + "," + uploads);
}
</script>

<a bind:this={file_button} class="upload_task" {href} {target}>
	<div class="thumbnail">
		{#if job.status === "queued"}
			<i class="icon">cloud_queue</i>
		{:else if job.status === "uploading"}
			<i class="icon">cloud_upload</i>
		{:else if job.status === "finished"}
			<img src="/api/file/{job.id}/thumbnail" alt="file thumbnail" />
		{:else if job.status === "error"}
			<i class="icon">error</i>
		{/if}
	</div>
	<div class="queue_body">
		<div class="title">
			{#if job.status === "error"}
				{error_reason}
			{:else}
				{job.name}
			{/if}
		</div>
		<div class="stats">
			{#if job.status === "queued"}
				Queued...
			{:else if job.status === "uploading"}
				<div class="stat">
					{(progress*100).toPrecision(3)}%
				</div>
				<div class="stat">
					ETA {formatDuration(remaining_time, 0)}
				</div>
				<div class="stat">
					{formatDataVolume(job.transfer_rate, 3)}/s
				</div>
			{:else if job.status === "finished"}
				<span class="file_link">
					{domain_url() + "/u/" + job.id}
				</span>
			{:else if job.status === "error"}
				{error_id}
			{/if}
		</div>
	</div>
</a>

<style>

.upload_task{
	position: relative;
	box-sizing: border-box;
	width: 420px;
	max-width: 90%;
	height: 3.8em;
	margin: 10px;
	padding: 0;
	overflow: hidden;
	border-radius: 2px;
	box-shadow: 2px 2px 8px -3px var(--shadow_color);
	background-color: var(--layer_3_color);
	color: var(--text_color);
	word-break: break-all;
	text-align: left;
	line-height: 1.2em;
	display: inline-flex;
	flex-direction: row;
	transition: box-shadow 0.3s, opacity 2s;
	white-space: normal;
	text-overflow: ellipsis;
	text-decoration: none;
	vertical-align: top;
	cursor: pointer;
}
.upload_task:hover {
	box-shadow: 0 0 2px 2px var(--highlight_color), inset 0 0 1px 1px var(--highlight_color);
	text-decoration: none;
}

.upload_task > .thumbnail {
	display: flex;
	flex: 0 0 auto;
	width: 3.8em;
	margin-right: 4px;
	align-items: center;
	justify-content: center;
}
.upload_task > .thumbnail > img {
	width: 100%;
}
.upload_task > .thumbnail > i {
	font-size: 3em;
}
.upload_task > .queue_body {
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
}
.upload_task > .queue_body > .title {
	flex: 1 1 auto;
	overflow: hidden;
}
.upload_task > .queue_body > .stats {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	height: 1.4em;
	border-top: 1px solid var(--layer_3_color_border);
	text-align: center;
	font-family: sans-serif, monospace;
	font-size: 0.9em;
}
.upload_task > .queue_body > .stats > .stat {
	flex: 0 1 100%;
}

.file_link{
	color: var(--highlight_color);
}
</style>
