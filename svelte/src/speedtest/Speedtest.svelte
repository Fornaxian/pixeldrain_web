<script>
import { onMount } from "svelte";
import Button from "../layout/Button.svelte";
import { formatDataVolume, formatDataVolumeBits } from "../util/Formatting.svelte";
import ProgressBar from "../util/ProgressBar.svelte";
import CopyButton from "../layout/CopyButton.svelte";

let running = false
let data_received = 0
const update_interval = 100
const start = async (dur = 10000) => {
	if (running) {
		return
	}

	running = true
	data_received = 0

	await measure_latency()

	// Start a request for 10 GB of random data. We omit credentials so the
	// server does fetch the API key from the database which increases latency
	const req = await fetch(
		window.api_endpoint+"/misc/speedtest?limit="+10e9,
		{credentials: "omit"},
	)
	const reader = req.body.getReader();

	measure_speed(() => reader.cancel(), dur)

	while(true) {
		const {done, value} = await reader.read()
		if (done) {
			break;
		}
		data_received += value.byteLength;
	}

	running = false
}

let latency = 0
const measure_latency = async () => {
	// We request one byte from the server ten times. If the latency of one
	// request is lower than the last one then that latency is saved in the
	// 'latency' variable
	const tests = 10
	let start = 0
	let latency_min = 1e9
	for (let i = 0; i < tests; i++) {
		start = Date.now()

		// Measure how long it takes to download 0 bytes. Effectively a ping
		await fetch(
			window.api_endpoint+"/misc/speedtest?limit=0",
			{credentials: "omit"},
		)

		latency = Date.now() - start
		if (latency < latency_min) {
			latency_min = latency
		}

		// Update the progress bar
		progress_duration = (i+1)/tests
	}
	latency = latency_min
}

// Average speed for the whole test
let speed = 0
let result_link = ""
let server = ""

let progress_duration = 0
let progress_unchanged = 0

const measure_speed = (stop, test_duration) => {
	speed = 0
	result_link = ""
	server = window.server_hostname

	// Updates per second
	const ups = (1000/update_interval)

	// This slice contains the speed measurements for two seconds of the test.
	// This value is averaged and if the average is higher than the previously
	// calculated average then it is saved. The resulting speed is the highest
	// speed that was sustained for two seconds at any point in the test
	const hist = new Uint32Array(ups*2)
	let idx = 0

	// This var measures for how many ticks the max speed has not changed. When
	// the speed has not changed for a third of the test duration the test is
	// considered over
	let unchanged = 0
	const unchanged_limit = (test_duration/3)/update_interval


	console.debug(
		"Test duration", test_duration,
		"interval", update_interval,
		"unchanged_limit", unchanged_limit,
		"history", hist.length,
	)

	// Variables used in the loop
	let previous_transferred = 0
	const start = Date.now()

	const measure = async () => {
		// Update the speed measurement
		hist[idx%hist.length] = data_received - previous_transferred
		previous_transferred = data_received
		idx++

		// Calculate the average of all the speed measurements
		const sum = hist.reduce((acc, val) => acc += val, 0)
		const new_speed = (sum/hist.length)*ups
		if (new_speed > speed) {
			speed = new_speed
			unchanged = 0
		} else {
			unchanged++
		}

		// Update the duration of the test. Used for calculating progress and
		// clock drift
		const current_duration = Date.now() - start

		// Update the progress bar
		progress_unchanged = unchanged/unchanged_limit
		progress_duration = current_duration/test_duration

		if (idx < test_duration/update_interval && unchanged < unchanged_limit) {
			// We have to manually calculate and subtract drift, because in my
			// tests with setInterval the clock would drift like 200ms in a
			// single test which significantly impacts results
			setTimeout(measure, update_interval - (current_duration-(idx*update_interval)))
		} else {
			// Test is done, break the reader out of the counting loop
			await stop()

			console.debug(
				"Done! Test ran for", current_duration,
				"result did not change for", unchanged*update_interval,
			)
			progress_unchanged = 0
			progress_duration = 0

			// Update the URL so the results can be shared
			history.replaceState(
				undefined,
				undefined,
				"#s="+Math.round(speed)+
					"&l="+latency+
					"&t="+data_received+
					"&h="+encodeURIComponent(server),
			)
			result_link = window.location.href
		}
	}

	// Start the measurement loop
	setTimeout(measure, update_interval)
}

onMount(() => {
	// Parse the results saved in the URL, if any
	if (window.location.hash[0] === "#") {
		const hash = window.location.hash.replace("#", "");
		const result = hash.split('&').reduce((res, item) => {
			const parts = item.split('=')
			res[parts[0]] = parts[1]
			return res;
		}, {});
		if (result.s) { speed = Number(result.s) }
		if (result.l) { latency = Number(result.l) }
		if (result.t) { data_received = Number(result.t) }
		if (result.h) { server = decodeURIComponent(result.h) }
		result_link = window.location.href
	}
	if (server === "") {
		server = window.server_hostname
	}
})
</script>

<section class="highlight_border">
	<div style="text-align: center">
		<Button icon="speed" label="Start test" click={() => start(12000)} disabled={running} highlight={!running}/>
		<Button icon="speed" label="Long test" click={() => start(30000)} disabled={running}/>
		<CopyButton text={result_link}>Copy test result</CopyButton>
	</div>

	<!-- This progress bar shows either the progress for the test duration, or
	when the test will time out. Whichever is higher -->
	<ProgressBar
		animation="linear"
		speed={update_interval}
		used={Math.max(progress_unchanged, progress_duration)}
		total={1}
	/>

	<div class="speed_stats">
		<div class="highlight_shaded">{formatDataVolume(speed, 4)}/s</div>
		<div class="highlight_shaded">{formatDataVolumeBits(speed, 4)}ps</div>
		<div class="highlight_shaded">Ping {latency}ms</div>
		<div class="highlight_shaded">Loaded {formatDataVolume(data_received, 3)}</div>
		<div class="highlight_shaded">Host {server}</div>
	</div>

	<!-- Progress bar starts at log10(6) because the we want the lowest speed
	shown to be 1 Mbps (1e6 bits) -->
	<ProgressBar animation="linear" speed={update_interval} used={Math.log10(speed*8)-6} total={4}/>

	<div class="speed_grid">
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
		<div>↑</div>
	</div>
	<div class="speed_grid">
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
	flex: 1 0 10em;
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
