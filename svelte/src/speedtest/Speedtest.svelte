<script>
import { onMount } from "svelte";
import Button from "../layout/Button.svelte";
import { formatDataVolume, formatDataVolumeBits } from "../util/Formatting.svelte";
import ProgressBar from "../util/ProgressBar.svelte";
import { copy_text } from "../util/Util.svelte";

let running = false
let data_received = 0
let update_interval = 100
let test_duration = 0
let current_duration = 0
let latency = 0
const start = async (dur = 6000) => {
	if (running) {
		return
	}

	running = true
	test_duration = dur
	data_received = 0

	let latency_start = Date.now()

	// Start a request for 10 GB of random data. We omit credentials so the
	// server does fetch the API key from the database which increases latency
	let req = await fetch(
		window.api_endpoint+"/misc/speedtest?limit="+10e9,
		{credentials: "omit"},
	)

	// Measure request latency
	latency = Date.now() - latency_start

	let reader = req.body.getReader();

	measure_speed(reader, update_interval, test_duration)

	// Read from the connection, add the received data to the total
	while(true) {
		const {done, value} = await reader.read();
		if (done) {
			break;
		}
		data_received += value.length;
	}

	running = false
}

// Average speed for the whole test
let speed = 0
let result_link = ""

const measure_speed = (reader, update_interval, test_duration) => {
	// We measure the transfer speed for 1/3 the duration of the test, after
	// that we start overwriting the lowest speed values with the highest speed
	// values to account for slow start and jitter. At the end of the test the
	// average speed in this array is the final result.
	let hist = new Array((test_duration/3)/update_interval)
	let idx = 0
	let previous_transferred = 0
	let start = Date.now()

	console.debug("History length", hist.length)

	let measure = async () => {
		let current_speed = data_received - previous_transferred
		previous_transferred = data_received

		// If the current measurement is higher than the last measurement we
		// save it in the speed history array
		if (hist[idx%hist.length] === undefined || current_speed > hist[idx%hist.length]) {
			hist[idx%hist.length] = current_speed
		}
		idx++

		// Calculate the average of the speed measurements
		let sum = hist.reduce((acc, val) => {
			if (val !== undefined) {
				acc.sum += val
				acc.count++
			}
			return acc
		}, {sum: 0, count: 0})
		speed = (sum.sum/sum.count)*(1000/update_interval)

		// Only used for the progress bar
		current_duration = Date.now() - start

		if (idx < test_duration/update_interval) {
			// We have to manually calculate and subtract drift, because in my
			// tests with setInterval the clock would drift like 200ms in a
			// single test which significantly impacts results
			setTimeout(measure, update_interval - (current_duration-(idx*update_interval)))
		} else {
			console.debug("Done! Test ran for", current_duration, )
			current_duration = 0
			await reader.cancel()

			history.replaceState(
				undefined,
				undefined,
				"#s="+speed+"&l="+latency+"&t="+data_received,
			)
			result_link = window.location.href
		}
	}

	setTimeout(measure, update_interval)
}

onMount(() => {
	if (window.location.hash[0] === "#") {
		var hash = window.location.hash.replace("#", "");
		let result = hash.replace("#", "").split('&').reduce((res, item) => {
			let parts = item.split('=')
			let n = Number(parts[1])
			if (n !== NaN) {
				res[parts[0]] = n
			}
			return res;
		}, {});

		if (result.s && result.l && result.t) {
			speed = result.s
			latency = result.l
			data_received = result.t
			result_link = window.location.href
		}
	}
})
</script>

<section class="highlight_border">
	<div style="text-align: center">
		<Button icon="speed" label="Start test" click={() => start(6000)} disabled={running} highlight={!running}/>
		<Button icon="speed" label="Long test" click={() => start(12000)} disabled={running}/>
		<Button
			highlight_on_click
			disabled={result_link === ""}
			icon="content_copy"
			label="Copy test result"
			click={e => copy_text(result_link)}
		/>
	</div>

	<ProgressBar animation="linear" speed={update_interval} total={test_duration} used={current_duration}/>

	<div class="speed_stats">
		<div class="highlight_shaded">{formatDataVolume(speed, 4)}/s</div>
		<div class="highlight_shaded">{formatDataVolumeBits(speed, 4)}ps</div>
		<div class="highlight_shaded">Latency {latency}ms</div>
		<div class="highlight_shaded">Received {formatDataVolume(data_received, 3)}</div>
	</div>
	<!-- Progress bar starts at log10(3) becasue the we want the lowest speed shown to be 1 kB/s -->
	<ProgressBar animation="linear" speed={update_interval} used={Math.log10(speed*8)-5} total={5}/>

	<div class="speed_grid">
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
	</div>
	<div class="speed_grid">
		<div>100 kb</div>
		<div>1 Mb</div>
		<div>10 Mb</div>
		<div>100 Mb</div>
		<div>1 Gb</div>
		<div>10 Gb</div>
	</div>
</section>

<style>
.speed_stats {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	font-size: 1.5em;
}
.speed_stats > * {
	flex: 1 0 9em;
}
.speed_grid {
	display: flex;
	justify-content: space-between;
	line-height: 1em;
}
.speed_grid > * {
	flex: 0 0 auto;
}
</style>
