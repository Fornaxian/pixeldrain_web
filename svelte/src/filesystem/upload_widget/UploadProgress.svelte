<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";
import { upload_file } from "./UploadFunc";
import ProgressBar from "../../util/ProgressBar.svelte";
import Button from "../../layout/Button.svelte"

let dispatch = createEventDispatcher()
export let job = {
	file: null,
	path: "",
	name: "",
	status: "",
}
export let total = 0
export let loaded = 0
let error_code = ""
let error_message = ""
let xhr = null

export const start = () => {
	xhr = upload_file(
		job.file,
		job.path,
		(prog_loaded, prog_total) => {
			loaded = prog_loaded
			total = prog_total
		},
		async () => {
			job.status = "finished"
			dispatch("finished")
		},
		(code, message) => {
			if (job.status === "finished") {
				return
			}

			console.log("Upload error", code, message)
			error_code = code
			error_message = message
			job.status = "error"

			// We don't send the finished signal so the user can read the error
			// messsage and manually dismiss it through the cancel button
		},
	)

	job.status = "uploading"
}

const cancel = () => {
	job.status = "finished"

	if (xhr && xhr.abort) {
		xhr.abort()
	}

	xhr = null
	dispatch("finished")
}
</script>

<div class="prog" transition:fade={{duration: 200}} class:error={job.status === "error"}>
	<div class="bar">
		{job.file.name}<br/>
		{#if error_code !== ""}
			{error_message}<br/>
			{error_code}<br/>
		{/if}
		<ProgressBar total={total} used={loaded}/>
	</div>
	<div class="cancel">
		<Button icon="cancel" click={cancel}/>
	</div>
</div>

<style>
.prog {
	display: flex;
	flex-direction: row;
	width: 100%;
	overflow: hidden;
}
.bar {
	flex: 1 1 auto;
	padding: 2px 4px 1px 4px;
	margin: 4px;
	border-radius: 4px;
	overflow: hidden;
	line-break: anywhere;
}
.cancel {
	flex: 0 0 content;
	display: flex;
	justify-content: center;
	align-items: center; /* Stop stretching the button */
}
.error {
	background: var(--danger_color);
	color: var(--highlight_text_color);
}
</style>
