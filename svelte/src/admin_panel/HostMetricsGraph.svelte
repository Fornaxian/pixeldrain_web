<script lang="ts">
import { onMount } from "svelte";
import Chart from "util/Chart.svelte";
import { host_colour, host_label } from "./HostMetricsLib";
import { get_host_metrics, type HostMetrics } from "lib/AdminAPI";
import { formatDate } from "util/Formatting";

export let metric = ""
export let window = 0 // Size of the data window in minutes
export let interval = 0 // Interval of the datapoints in minutes
export let data_type = "number"
export let aggregate = false

// Make load_graph reactive
$: {load_graph(metric, window, interval, aggregate)}

let chart: Chart
let chartTimeout = null

const load_graph = async (_metric: string, _window: number, _interval: number, _aggregate: boolean) => {
	if (chartTimeout !== null) { clearTimeout(chartTimeout) }
	chartTimeout = setTimeout(() => { load_graph(metric, window, interval, aggregate) }, 10000)

	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - _window)

	try {
		const metrics = await get_host_metrics(start, today, _metric, _interval)

		// Format the dates
		metrics.timestamps.forEach((val: string, idx: number) => {
			metrics.timestamps[idx] = formatDate(val, true, true, true)
		});
		chart.data().labels = metrics.timestamps;

		// If the dataset uses the duration type, we need to convert the values
		// to milliseconds
		if (data_type === "duration") {
			for (const host of Object.keys(metrics.host_amounts)) {
				for (let i = 0; i < metrics.host_amounts[host].length; i++) {
					// Go durations are expressed on nanoseconds, divide by 1
					// million to convert to milliseconds
					metrics.host_amounts[host][i] /= 1000000
				}
			}
		}

		// Truncate the datasets array in case we have more datasets cached than
		// there are in the response
		chart.data().datasets.length = Object.keys(metrics.host_amounts).length

		let i = 0
		if (_aggregate) {
			i = 1
			chart.data().datasets[0] = {
				label: "aggregate",
				data: create_aggregate_dataset(metrics),
				borderWidth: 1,
				pointRadius: 0,
				borderColor: "#ffffff",
				backgroundColor: "#ffffff",
			}
		}

		for (const host of Object.keys(metrics.host_amounts).sort()) {
			if (chart.data().datasets[i] === undefined) {
				chart.data().datasets[i] = {
					label: "",
					data: [],
					borderWidth: 1,
					pointRadius: 0,
				}
			}
			chart.data().datasets[i].label = await host_label(host)
			chart.data().datasets[i].borderColor = host_colour(host)
			chart.data().datasets[i].backgroundColor = host_colour(host)
			chart.data().datasets[i].data = metrics.host_amounts[host]
			i++
		}

		chart.update()
	} catch (error) {
		alert(error)
	}
}

const create_aggregate_dataset = (metrics: HostMetrics): number[] => {
	let data: number[] = []

	for (const host of Object.keys(metrics.host_amounts)) {
		for (let idx = 0; idx < metrics.host_amounts[host].length; idx++) {
			if (data[idx]===undefined) {
				data[idx] = 0
			}
			data[idx] += metrics.host_amounts[host][idx]
		}
	}
	return data
}

onMount(() => {
	load_graph(metric, window, interval, aggregate);

	return () => {
		if (chartTimeout !== null) {
			clearTimeout(chartTimeout)
		}
	}
})
</script>

<div>
	<div class="title">{metric}</div>
	<Chart bind:this={chart} data_type={data_type} height="400px" legend={false} ticks={false} animations={false} />
</div>

<style>
.title {
	font-size: 1.2em;
}
</style>
