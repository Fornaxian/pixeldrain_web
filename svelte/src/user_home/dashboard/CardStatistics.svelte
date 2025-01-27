<script>
import { onMount } from "svelte";
import Chart from "../../util/Chart.svelte";
import { color_by_name } from "../../util/Util.svelte";
import { formatDataVolume, formatThousands } from "../../util/Formatting.svelte";

export let card_size = 1
$: chart_height = (80 + (card_size * 60)) + "px"
let graph_views_downloads = null
let graph_bandwidth = null

let load_graphs = async (minutes, interval) => {
	let end = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - minutes)

	try {
		let views = get_graph_data("views", start, end, interval);
		let downloads = get_graph_data("downloads", start, end, interval);
		let bandwidth = get_graph_data("bandwidth", start, end, interval);
		let transfer_paid = get_graph_data("transfer_paid", start, end, interval);
		views = await views
		downloads = await downloads
		bandwidth = await bandwidth
		transfer_paid = await transfer_paid

		graph_views_downloads.data().labels = views.timestamps;
		graph_views_downloads.data().datasets[0].data = views.amounts
		graph_views_downloads.data().datasets[1].data = downloads.amounts
		graph_bandwidth.data().labels = bandwidth.timestamps;
		graph_bandwidth.data().datasets[0].data = bandwidth.amounts
		graph_bandwidth.data().datasets[1].data = transfer_paid.amounts

		graph_views_downloads.update()
		graph_bandwidth.update()
	} catch (err) {
		console.error("Failed to update graphs", err)
		return
	}
}

let total_views = 0
let total_downloads = 0
let total_bandwidth = 0
let total_transfer_paid = 0

let get_graph_data = async (stat, start, end, interval) => {
	let resp = await fetch(
		window.api_endpoint + "/user/time_series/" + stat +
		"?start=" + start.toISOString() +
		"&end=" + end.toISOString() +
		"&interval=" + interval
	)
	resp = await resp.json()

	// Convert the timestamps to a human-friendly format
	resp.timestamps.forEach((val, idx) => {
		let date = new Date(val);
		let str = date.getFullYear();
		str += "-" + ("00" + (date.getMonth() + 1)).slice(-2);
		str += "-" + ("00" + date.getDate()).slice(-2);
		str += " " + ("00" + date.getHours()).slice(-2);
		str += ":" + ("00" + date.getMinutes()).slice(-2);
		resp.timestamps[idx] = "  " + str + "  "; // Poor man's padding
	});

	// Add up the total amount and save it in the correct place
	let total = resp.amounts.reduce((acc, cur) => { return acc + cur }, 0)

	if (stat == "views") {
		total_views = total;
	} else if (stat == "downloads") {
		total_downloads = total;
		graph_views_downloads.update()
	} else if (stat == "bandwidth") {
		total_bandwidth = total;
	} else if (stat == "transfer_paid") {
		total_transfer_paid = total;
	}

	return resp
}

let graph_timespan = 0
let update_graphs = (minutes, interval) => {
	graph_timespan = minutes
	load_graphs(minutes, interval)
}

onMount(() => {
	graph_views_downloads.data().datasets = [
		{
			label: "Views",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("highlight_color"),
			backgroundColor: color_by_name("highlight_color"),
		},
		{
			label: "Downloads",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("danger_color"),
			backgroundColor: color_by_name("danger_color"),
		},
	];
	graph_bandwidth.data().datasets = [
		{
			label: "Free transfer",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("highlight_color"),
			backgroundColor: color_by_name("highlight_color"),
		},
		{
			label: "Premium transfer",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("danger_color"),
			backgroundColor: color_by_name("danger_color"),
		}
	];

	update_graphs(43200, 1440);
})
</script>

<div class="time_buttons">
	<button
		on:click={() => update_graphs(1440, 1)}
		class:button_highlight={graph_timespan == 1440}
		class="group_first">
		Day
	</button>
	<button
		on:click={() => update_graphs(10080, 60)}
		class:button_highlight={graph_timespan == 10080}
		class="group_middle">
		Week
	</button>
	<button
		on:click={() => update_graphs(43200, 1440)}
		class:button_highlight={graph_timespan == 43200}
		class="group_middle">
		Month
	</button>
	<button
		on:click={() => update_graphs(131400, 1440)}
		class:button_highlight={graph_timespan == 131400}
		class="group_middle">
		Quarter
	</button>
	<button
		on:click={() => update_graphs(525600, 1440)}
		class:button_highlight={graph_timespan == 525600}
		class="group_middle">
		Year
	</button>
	<button
		on:click={() => update_graphs(1051200, 1440)}
		class:button_highlight={graph_timespan == 1051200}
		class="group_last">
		Two Years
	</button>
</div>

<Chart bind:this={graph_bandwidth} data_type="bytes" height={chart_height} ticks={false}/>
<div class="center">
	{formatDataVolume(total_bandwidth, 3)} free downloads and
	{formatDataVolume(total_transfer_paid, 3)} paid downloads
</div>

<Chart bind:this={graph_views_downloads} data_type="number" height={chart_height} ticks={false}/>
<div class="center">
	{formatThousands(total_views)} views and
	{formatThousands(total_downloads)} downloads
</div>

<style>
.center {
	text-align: center;
}
.time_buttons {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	gap: 2px;
}
.time_buttons > button {
	min-width: 3em;
	justify-content: center;
}
</style>
