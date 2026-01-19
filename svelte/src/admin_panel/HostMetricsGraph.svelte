<script lang="ts">
import { onMount } from "svelte";
import Chart from "util/Chart.svelte";
import { get_endpoint } from "lib/PixeldrainAPI";
import { host_colour, host_label } from "./HostMetricsLib";

export let metric = ""
export let window = 0 // Size of the data window in minutes
export let interval = 0 // Interval of the datapoints in minutes
export let data_type = "number"

let chart: Chart
let chartTimeout = null

const loadGraph = () => {
	if (chartTimeout !== null) { clearTimeout(chartTimeout) }
	chartTimeout = setTimeout(() => { loadGraph() }, 10000)

	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - window)

	fetch(
		get_endpoint() + "/admin/host_metrics" +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&metric="+ metric +
		"&interval=" + interval
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: " + resp.status); }
		return resp.json();
	}).then(async resp => {

		resp.timestamps.forEach((val: string, idx: number) => {
			let date = new Date(val);
			let dateStr: string = date.getFullYear().toString();
			dateStr += "-" + ("00" + (date.getMonth() + 1)).slice(-2);
			dateStr += "-" + ("00" + date.getDate()).slice(-2);
			dateStr += " " + ("00" + date.getHours()).slice(-2);
			dateStr += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.timestamps[idx] = " " + dateStr + " "; // Poor man's padding
		});
		chart.data().labels = resp.timestamps;

		let i = 0
		for (const host of Object.keys(resp.host_amounts).sort()) {
			if (chart.data().datasets[i] === undefined) {
				chart.data().datasets[i] = {
					label: await host_label(host),
					data: [],
					borderWidth: 1,
					pointRadius: 0,
				}
			}
			chart.data().datasets[i].borderColor = host_colour(host)
			chart.data().datasets[i].backgroundColor = host_colour(host)

			if (data_type === "duration") {
				for (let i = 0; i < resp.host_amounts[host].length; i++) {
					// Go durations are expressed on nanoseconds, divide by 1
					// million to convert to milliseconds
					resp.host_amounts[host][i] /= 1000000
				}
			}

			chart.data().datasets[i].data = resp.host_amounts[host]
			i++
		}

		chart.update()
	})
}

onMount(() => {
	loadGraph();

	return () => {
		if (chartTimeout !== null) {
			clearTimeout(chartTimeout)
		}
	}
})
</script>

<div>
	<div class="title">{metric}</div>
	<Chart bind:this={chart} data_type={data_type} legend={false} ticks={false} animations={false} />
</div>

<style>
.title {
	font-size: 1.2em;
}
</style>
