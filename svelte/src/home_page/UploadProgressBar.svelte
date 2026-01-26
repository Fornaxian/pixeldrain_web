<script>
import { add_upload_history, domain_url } from "util/Util.svelte"
import { formatDataVolume, formatDuration } from "util/Formatting"
import Spinner from "util/Spinner.svelte";

export let job = {}
let file_button
let progress_bar
let tries = 0
let start_time = 0
let remaining_time = 0

let last_update_time = 0
let progress = 0
let transfer_rate = 0
const on_progress = (loaded, total) => {
	job.loaded_size = loaded
	job.total_size = total

	if (last_update_time === 0) {
		last_update_time = new Date().getTime()
		return
	}

	let current_time = new Date().getTime()
	last_update_time = current_time

	let elapsed_time = current_time - start_time
	remaining_time = (elapsed_time/progress) - elapsed_time

	progress = job.loaded_size / job.total_size

	// Calculate transfer rate by dividing the total uploaded size by the total
	// running time
	transfer_rate = Math.floor(job.loaded_size / ((current_time - start_time) / 1000))
	progress_bar.style.width = (progress * 100) + "%"

	if (progress >= 1) {
		job.status = "processing"
		progress_bar.style.opacity = "0"
	} else {
		progress_bar.style.opacity = "1"
	}
}

let href = null
let target = null
const on_success = (resp) => {
	transfer_rate = 0
	job.loaded_size = job.total_size
	job.file = null // Delete reference to file to free memory

	job.id = resp.id
	job.status = "finished"
	job.on_finished(job)

	add_upload_history(resp.id)

	href = "/u/"+resp.id
	target = "_blank"

	progress_bar.style.width = "100%"
	progress_bar.style.opacity = "0"
}

let error_id = ""
let error_reason = ""
const on_failure = (status, message) => {
	transfer_rate = 0
	job.loaded_size = job.total_size
	job.file = null // Delete reference to file to free memory

	error_id = status
	error_reason = message
	job.status = "error"
	file_button.style.background = 'var(--danger_color)'
	file_button.style.color = 'var(--highlight_text_color)'
	progress_bar.style.width = "0"

	job.on_finished(job)
}

export const start = () => {
	job.status = "uploading"

	// Check the file size limit. For free accounts it's 10 GB
	if (window.user.subscription.file_size_limit === 0) {
		window.user.subscription.file_size_limit = 10e9
	}
	if (job.total_size > window.user.subscription.file_size_limit) {
		on_failure(
			"file_too_large",
			"This file is too large. Check out the Pro subscription to increase the file size limit"
		)
		return
	}

	start_time = new Date().getTime()

	let xhr = new XMLHttpRequest();
	xhr.open("PUT", window.api_endpoint+"/file/"+encodeURIComponent(job.name), true);
	xhr.timeout = 86400000; // 24 hours, to account for slow connections

	xhr.upload.addEventListener("progress", evt => {
		if (evt.lengthComputable) {
			on_progress(evt.loaded, evt.total)
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

			let resp = {}
			if (xhr.status === 429) {
				resp = {
					value: "too_many_requests",
					message: "Too many requests. Please wait a few seconds",
				}
			} else {
				resp = JSON.parse(xhr.response)
			}

			if (resp.value == "file_too_large"
				|| resp.value == "ip_banned"
				|| resp.value == "user_out_of_space"
				|| tries === 3) {
				// Permanent failure
				on_failure(resp.value, resp.message)
			} else {
				// Temporary failure, try again in 5 seconds
				tries++
				setTimeout(start, 5000)
			}
		} else if (xhr.status === 0) {
			on_failure("request_failed", "The connection was interrupted")
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

	xhr.send(job.file);
}

</script>

<a bind:this={file_button} class="upload_task" {href} {target}>
	<div class="top_half">
		<div class="thumbnail">
			{#if job.status === "queued"}
				<i class="icon">cloud_queue</i>
			{:else if job.status === "uploading"}
				<i class="icon">cloud_upload</i>
			{:else if job.status === "processing"}
				<Spinner></Spinner>
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
						{formatDataVolume(transfer_rate, 3)}/s
					</div>
				{:else if job.status === "processing"}
					Calculating parity data...
				{:else if job.status === "finished"}
					<span class="file_link">
						{domain_url() + "/u/" + job.id}
					</span>
				{:else if job.status === "error"}
					{error_id}
				{/if}
			</div>
		</div>
	</div>
	<div class="progress">
		<div bind:this={progress_bar} class="progress_bar"></div>
	</div>
</a>

<style>

.upload_task{
	position: relative;
	width: 440px;
	max-width: 95%;
	height: 4em;
	margin: 6px;
	padding: 0;
	overflow: hidden;
	border-radius: 6px;
	background: var(--input_background);
	color: var(--body_text_color);
	word-break: break-all;
	text-align: left;
	line-height: 1.2em;
	display: inline-flex;
	flex-direction: column;
	transition: background 0.2s, opacity 2s;
	white-space: normal;
	text-overflow: ellipsis;
	text-decoration: none;
	vertical-align: top;
	cursor: pointer;
}
.top_half {
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	overflow: hidden;
}
.upload_task:hover {
	background: var(--input_hover_background);
	text-decoration: none;
}

.thumbnail {
	display: flex;
	flex: 0 0 auto;
	width: 4em;
	margin-right: 4px;
	align-items: center;
	justify-content: center;
}
.thumbnail > img {
	width: 90%;
	border-radius: 4px;
}
.thumbnail > i {
	font-size: 3em;
}
.queue_body {
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
}
.queue_body > .title {
	flex: 1 1 auto;
	overflow: hidden;
}
.queue_body > .stats {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	height: 1.4em;
	border-top: 1px solid var(--separator);
	text-align: center;
	font-family: sans-serif, monospace;
	font-size: 0.9em;
}
.queue_body > .stats > .stat {
	flex: 0 1 100%;
}
.file_link{
	color: var(--highlight_color);
}
.progress {
	flex: 0 0 auto;
	height: 3px;
}
.progress_bar {
	background: var(--highlight_background);
	height: 100%;
	width: 0;
	transition: width 0.25s, opacity 3s;
	transition-timing-function: linear, ease;
}
</style>
