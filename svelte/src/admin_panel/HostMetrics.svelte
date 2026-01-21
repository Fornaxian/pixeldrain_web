<script lang="ts">
import { onDestroy, onMount } from "svelte";
import HostMetricsGraph from "./HostMetricsGraph.svelte";
import { get_host_metrics, load_host_names, type HostMetrics } from "./HostMetricsLib";
import Expandable from "util/Expandable.svelte";
import ToggleButton from "layout/ToggleButton.svelte";
import { formatDate } from "util/Formatting";

const groups: {
	title: string,
	graphs: {
		metric: string,
		agg_base?: string,
		agg_divisor?: string,
		data_type: string,
	}[],
}[] = [
	{
		title: "API",
		graphs: [
			{metric: "api_request", data_type: "number"},
			{metric: "api_request_duration", data_type: "duration"},
			{metric: "api_request_duration_avg", agg_base: "api_request_duration", agg_divisor: "api_request", data_type: "duration"},
			{metric: "api_error", data_type: "number"},
			{metric: "api_panic", data_type: "number"},
		],
	}, {
		title: "Task scheduler",
		graphs: [
			{metric: "scheduler_file_instance_expire", data_type: "number"},
			{metric: "scheduler_file_instance_expire_size", data_type: "bytes"},
			{metric: "scheduler_file_reference_delete", data_type: "number"},
			{metric: "scheduler_timeseries_delete", data_type: "number"},
			{metric: "scheduler_thumbnail_delete", data_type: "number"},
			{metric: "abuse_file_instance_blocked", data_type: "number"},
			{metric: "abuse_filesystem_blocked", data_type: "number"},
		],
	}, {
		title: "Database",
		graphs: [
			{metric: "database_query", data_type: "number"},
			{metric: "database_query_duration", data_type: "duration"},
			{metric: "database_query_duration_avg", agg_base: "database_query_duration", agg_divisor: "database_query", data_type: "duration"},
			{metric: "database_query_rows", data_type: "number"},
			{metric: "database_query_rows_avg", agg_base: "database_query_rows", agg_divisor: "database_query", data_type: "number"},
			{metric: "database_query_retries", data_type: "number"},
			{metric: "database_query_error", data_type: "number"},
		],
	}, {
		title: "Pixelstore",
		graphs: [
			{metric: "pixelstore_write", data_type: "number"},
			{metric: "pixelstore_write_size", data_type: "bytes"},
			{metric: "pixelstore_cache_fetch", data_type: "number"},
			{metric: "pixelstore_cache_fetch_size", data_type: "bytes"},
			{metric: "pixelstore_cache_delete", data_type: "number"},
			{metric: "pixelstore_connection_error", data_type: "number"},
			{metric: "pixelstore_peer_down", data_type: "number"},
			{metric: "pixelstore_peer_up", data_type: "number"},
		],
	}, {
		title: "Pixelstore reads",
		graphs: [
			{metric: "pixelstore_cache_read", data_type: "number"},
			{metric: "pixelstore_neighbour_read", data_type: "number"},
			{metric: "pixelstore_reed_solomon_read", data_type: "number"},
			{metric: "pixelstore_cache_read_size", data_type: "bytes"},
			{metric: "pixelstore_neighbour_read_size", data_type: "bytes"},
			{metric: "pixelstore_reed_solomon_read_size", data_type: "bytes"},
			{metric: "pixelstore_read_retry_success", data_type: "number"},
			{metric: "pixelstore_read_retry_error", data_type: "number"},
		],
	}, {
		title: "Pixelstore shards",
		graphs: [
			{metric: "pixelstore_shard_delete", data_type: "number"},
			{metric: "pixelstore_shard_delete_size", data_type: "bytes"},
			{metric: "pixelstore_shard_repair", data_type: "number"},
			{metric: "pixelstore_shard_repair_size", data_type: "bytes"},
			{metric: "pixelstore_shard_move", data_type: "number"},
			{metric: "pixelstore_shard_move_size", data_type: "bytes"},
		],
	}, {
		title: "Pixelstore API",
		graphs: [
			{metric: "pixelstore_api_error_400", data_type: "number"},
			{metric: "pixelstore_api_error_500", data_type: "number"},
			{metric: "pixelstore_api_put_file", data_type: "number"},
			{metric: "pixelstore_api_put_file_size", data_type: "bytes"},
			{metric: "pixelstore_api_get_file", data_type: "number"},
			{metric: "pixelstore_api_file_exists", data_type: "number"},
			{metric: "pixelstore_api_status", data_type: "number"},
		],
	},
]

let dataWindow: number = 60
let dataInterval: number = 1
let showAggregate: boolean = false
let metrics: HostMetrics = {timestamps: [], metrics: {}}
let metrics_timeout: number = null

const load_metrics = async (window: number, interval: number) => {
	if (metrics_timeout !== null) { clearTimeout(metrics_timeout) }
	metrics_timeout = setTimeout(() => { load_metrics(dataWindow, dataInterval) }, 10000)

	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - window)

	let metrics_list: string[] = []
	for (const group of groups) {
		for (const graph of group.graphs) {
			if (graph.metric !== undefined) {
				metrics_list.push(graph.metric)
			}
		}
	}

	try {
		metrics = await get_host_metrics(start, today, metrics_list, interval)

		// Format the dates
		metrics.timestamps.forEach((val: string, idx: number) => {
			metrics.timestamps[idx] = formatDate(val, true, true, true)
		});
	} catch (error) {
		alert(error)
	}

	// If the dataset uses the duration type, we need to convert the values
	// to milliseconds
	for (const group of groups) {
		for (const graph of group.graphs) {
			if (graph.data_type === "duration" && metrics.metrics[graph.metric] !== undefined) {
				for (const host of Object.keys(metrics.metrics[graph.metric])) {
					for (let i = 0; i < metrics.metrics[graph.metric][host].length; i++) {
						// Go durations are expressed on nanoseconds, divide by
						// 1 million to convert to milliseconds
						metrics.metrics[graph.metric][host][i] /= 1000000
					}
				}
			}

			// If the graph is an aggregate, we'll need to create a new dataset
			// with the child datasets as base. Here we create a new dataset by
			// dividing one dataset by another
			if (graph.agg_base !== undefined && graph.agg_divisor !== undefined) {
				for (const host of Object.keys(metrics.metrics[graph.agg_base])) {
					metrics.metrics[graph.metric][host] = []
					for (let i = 0; i < metrics.metrics[graph.agg_base][host].length; i++) {
						if (metrics.metrics[graph.agg_divisor][host][i] > 0) {
							metrics.metrics[graph.metric][host].push(
								metrics.metrics[graph.agg_base][host][i] / metrics.metrics[graph.agg_divisor][host][i]
							)
						} else {
							metrics.metrics[graph.metric][host].push(0)
						}
					}
				}
			}
		}
	}
}

const setWindow = (window: number, interval: number) => {
	dataWindow = window
	dataInterval = interval
	load_metrics(dataWindow, dataInterval);
}

let loaded = false
onMount(async () => {
	await load_host_names()
	await load_metrics(dataWindow, dataInterval);
	loaded = true
})
onDestroy(() => {
	if (metrics_timeout !== null) {
		clearTimeout(metrics_timeout)
	}
})
</script>

{#if loaded}
	<div class="highlight_border" style="margin-bottom: 6px;">
		<button on:click={() => setWindow(60, 1)}>Hour 1m</button>
		<button on:click={() => setWindow(720, 1)}>Half Day 1m</button>
		<button on:click={() => setWindow(1440, 60)}>Day 1h</button>
		<button on:click={() => setWindow(10080, 60)}>Week 1h</button>
		<button on:click={() => setWindow(43200, 60)}>Month 1h</button>
		<button on:click={() => setWindow(131400, 1440)}>Quarter 1d</button>
		<button on:click={() => setWindow(262800, 1440)}>Half-year 1d</button>
		<button on:click={() => setWindow(525600, 1440)}>Year 1d</button>
		<button on:click={() => setWindow(1051200, 1440)}>Two Years 1d</button>
		<button on:click={() => setWindow(2628000, 1440)}>Five Years 1d</button>
		<br/>
		<ToggleButton bind:on={showAggregate}>Aggregate</ToggleButton>
	</div>

	{#each groups as group (group.title)}
		<Expandable click_expand expanded>
			<div slot="header">
				<div class="title">{group.title}</div>
			</div>

			<div class="grid">
				{#each group.graphs as graph (graph.metric)}
					<HostMetricsGraph
						metric={graph.metric}
						data_type={graph.data_type}
						timestamps={metrics.timestamps}
						metrics={metrics.metrics[graph.metric]}
						aggregate={showAggregate}
					/>
				{/each}
			</div>
		</Expandable>
	{/each}
{/if}

<style>
.title {
	font-size: 1.6em;
	padding: 4px;
	text-align: center;
}
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
}
</style>
