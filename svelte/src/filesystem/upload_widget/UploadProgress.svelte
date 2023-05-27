<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";
import { upload_file } from "./UploadFunc";
import ProgressBar from "../../util/ProgressBar.svelte";

let dispatch = createEventDispatcher()
export let job = {
	file: null,
	name: "",
	id: "",
	status: "",
}
export let total = 0
export let loaded = 0
let error_code = ""
let error_message = ""

export const start = () => {
	upload_file(
		job.file,
		job.bucket,
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
			console.log("error", code, message)
			error_code = code
			error_message = message
			job.status = "error"

			// Wait with reporting so the user can read the error message
			setTimeout(() => dispatch("finished"), 60000)
		},
	)

	job.status = "uploading"
}

</script>

<div class="upload_progress" transition:fade={{duration: 200}} class:error={job.status === "error"}>
	{job.file.name}<br/>
	{#if error_code !== ""}
		{error_message}<br/>
		{error_code}<br/>
	{/if}
	<ProgressBar total={total} used={loaded}/>
</div>

<style>
.upload_progress {
	display: block;
	padding: 2px 4px 1px 4px;
	margin: 4px;
	border-radius: 4px;
}
.error {
	background: var(--danger_color);
	color: var(--highlight_text_color);
}
</style>
