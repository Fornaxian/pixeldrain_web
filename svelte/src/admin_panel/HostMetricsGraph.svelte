<script lang="ts">
import Chart from "util/Chart.svelte";
import { host_colour, host_label } from "./HostMetricsLib";
import { tick } from "svelte";

export let metric = ""
export let data_type = "number"
export let timestamps: string[] = []
export let metrics: {[key: string]: number[]} = {}
export let aggregate = false

// Make load_graph reactive
$: {update_chart(timestamps, metrics, aggregate)}

let chart: Chart

const update_chart = async (timestamps: string[], metrics: {[key: string]: number[]}, aggregate: boolean) => {
	await tick()
	chart.data().labels = [...timestamps];

	// Truncate the datasets array in case we have more datasets cached than
	// there are in the response
	chart.data().datasets.length = Object.keys(metrics).length

	let i = 0
	if (aggregate === true) {
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

	for (const host of Object.keys(metrics).sort()) {
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
		chart.data().datasets[i].data = [...metrics[host]]
		i++
	}

	chart.update()
}

const create_aggregate_dataset = (hosts: {[key:string]: number[]}): number[] => {
	let data: number[] = []
	for (const host of Object.keys(hosts)) {
		for (let idx = 0; idx < hosts[host].length; idx++) {
			if (data[idx]===undefined) {
				data[idx] = 0
			}
			data[idx] += hosts[host][idx]
		}
	}
	return data
}
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
