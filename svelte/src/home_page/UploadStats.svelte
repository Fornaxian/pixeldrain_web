<script>
import { formatDataVolume, formatDuration } from "../util/Formatting.svelte";
import ProgressBar from "../util/ProgressBar.svelte";

export let upload_queue = []

let stats_interval = null
let stats_interval_ms = 1000
let finished = false

export const start = () => {
	if (stats_interval === null) {
		start_time = new Date().getTime()
		stats_interval = setInterval(stats_update, stats_interval_ms)
	}

	finished = false
}

export const finish = () => {
	if (stats_interval !== null) {
		clearInterval(stats_interval)
		stats_interval = null
	}

	finished = true
	start_time = 0
	total_loaded = total_size
	previously_loaded = total_size
	total_progress = 1
	total_rate = 0

	document.title = "Finished! ~ pixeldrain"
}

let start_time = 0
let total_progress = 0
let total_size = 0
let total_loaded = 0
let previously_loaded = 0
let last_total_loaded = 0
let total_rate = 0
let elapsed_time = 0
let remaining_time = 0

const stats_update = () => {
	if (start_time === 0) {
		start_time = new Date().getTime()
	}

	// Get total size of upload queue and size of finished uploads
	total_size = 0
	total_loaded = 0
	for (let i = 0; i < upload_queue.length; i++) {
		total_size += upload_queue[i].total_size
		total_loaded += upload_queue[i].loaded_size
	}

	total_progress = (total_loaded - previously_loaded) / (total_size - previously_loaded)

	// Calculate ETA by estimating the total time and subtracting the elapsed time
	elapsed_time = new Date().getTime() - start_time
	remaining_time = (elapsed_time/total_progress) - elapsed_time

	// Calculate the rate by comparing the current progress with the last iteration
	total_rate = Math.floor(
		(total_rate * 0.8) +
		(((1000 / stats_interval_ms) * (total_loaded - last_total_loaded)) * 0.2)
	)
	last_total_loaded = total_loaded

	document.title = (total_progress*100).toFixed(0) + "% ~ " +
		formatDuration(remaining_time, 0) +
		" ~ uploading to pixeldrain"
}

</script>

<div class="stats_box">
	<div>
		Size {formatDataVolume(total_size, 3)}
	</div>
	<div>
		Progress {(total_progress*100).toPrecision(3)}%
	</div>
	{#if finished}
		<div>
			Time {formatDuration(elapsed_time, 0)}
		</div>
		<div>
			Rate {formatDataVolume(total_loaded / (elapsed_time/1000), 3)}/s
		</div>
	{:else}
		<div>
			ETA {formatDuration(remaining_time, 0)}
		</div>
		<div>
			Rate {formatDataVolume(total_rate, 3)}/s
		</div>
	{/if}
</div>

<ProgressBar total={total_size} used={total_loaded} animation="linear" speed={stats_interval_ms}/>

<style>
.stats_box {
	display: inline-grid;
	grid-template-columns: 25% 25% 25% 25%;
	width: 100%;
	text-align: center;
	font-family: sans-serif, monospace;
}
@media (max-width: 1000px) {
	.stats_box {
		grid-template-columns: 50% 50%;
	}
}
</style>
