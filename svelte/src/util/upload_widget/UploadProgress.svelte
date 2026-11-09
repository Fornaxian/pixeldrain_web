<script lang="ts">
import { fade } from "svelte/transition";
import ProgressBar from "util/ProgressBar.svelte";
import { upload_file } from "./UploadFunc";

let { job = $bindable(), on_finished }: {
	job: any;
	on_finished: () => void;
} = $props();
let total = $state(0)
let loaded = $state(0)
let error_code = $state("")
let error_message = $state("")

export const start = () => {
	upload_file(
		job.file,
		job.name,
		(prog_loaded, prog_total) => {
			loaded = prog_loaded
			total = prog_total
		},
		async (id) => {
			console.log("finsished", id)
			job.status = "finished"
			job.id = id
			on_finished()
		},
		(code, message) => {
			console.log("error", code, message)
			error_code = code
			error_message = message
			job.status = "error"
			on_finished()
		},
	)

	job.status = "uploading"
}

</script>

<div class="upload_progress" transition:fade={{duration: 200}} class:error={job.status === "error"}>
	{job.name}<br/>
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
