<script lang="ts">
import Chart from "util/Chart.svelte";
import { host_colour, host_label } from "./HostMetricsLib";
import { tick } from "svelte";

let {
	metric = "",
	data_type = "number",
	timestamps = [],
	metrics = {},
	aggregate = false
}: {
	metric?: string;
	data_type?: string;
	timestamps?: string[];
	metrics?: {[key: string]: number[]};
	aggregate?: boolean;
} = $props();

let chart: Chart = $state()

const update_chart = async (timestamps: string[], metrics: {[key: string]: number[]}, aggregate: boolean) => {
	await tick()
	chart.data().labels = [...timestamps];

	// Truncate the datasets array in case we have more datasets cached than
	// there are in the response
	chart.data().datasets.length = Object.keys(metrics).length

	if (aggregate === true) {
		chart.data().datasets.length = 2
		chart.data().datasets[0] = {
			label: "sum",
			data: create_sum_dataset(metrics),
			borderWidth: 1,
			pointRadius: 0,
			borderColor: "#ff0000",
			backgroundColor: "#ff0000",
		}
		chart.data().datasets[1] = {
			label: "average",
			data: create_avg_dataset(metrics),
			borderWidth: 1,
			pointRadius: 0,
			borderColor: "#00ff00",
			backgroundColor: "#00ff00",
		}
	} else {
		chart.data().datasets.length = Object.keys(metrics).length
		let i = 0
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
			chart.data().datasets[i].borderWidth = 1
			chart.data().datasets[i].borderColor = host_colour(host)
			chart.data().datasets[i].backgroundColor = host_colour(host)
			chart.data().datasets[i].data = [...metrics[host]]
			i++
		}
	}

	chart.update()
}

const create_sum_dataset = (hosts: {[key:string]: number[]}): number[] => {
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
const create_avg_dataset = (hosts: {[key:string]: number[]}): number[] => {
	// The calculate the average, we take the sum and divide it by the number of
	// hosts
	let data: number[] = create_sum_dataset(hosts)
	const num_hosts = Object.keys(hosts).length
	for (let idx=0; idx < data.length; idx++) {
		data[idx] /= num_hosts
	}
	return data
}
// Make load_graph reactive
$effect(() => {update_chart(timestamps, metrics, aggregate)});
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
