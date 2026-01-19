<script lang="ts">
import { onMount } from "svelte";
import HostMetricsGraph from "./HostMetricsGraph.svelte";
import { load_host_names } from "./HostMetricsLib";
import Expandable from "util/Expandable.svelte";

const groups: {
	title: string,
	graphs: {
		metric: string,
		data_type: string,
	}[],
}[] = [
	{
		title: "API",
		graphs: [
			{metric: "api_request", data_type: "number"},
			{metric: "api_request_duration", data_type: "duration"},
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
			{metric: "database_query_rows", data_type: "number"},
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
		],
	}, {
		title: "Pixelstore reads",
		graphs: [
			{metric: "pixelstore_cache_read", data_type: "number"},
			{metric: "pixelstore_cache_read_size", data_type: "bytes"},
			{metric: "pixelstore_neighbour_read", data_type: "number"},
			{metric: "pixelstore_neighbour_read_size", data_type: "bytes"},
			{metric: "pixelstore_reed_solomon_read", data_type: "number"},
			{metric: "pixelstore_reed_solomon_read_size", data_type: "bytes"},
			{metric: "pixelstore_connection_error", data_type: "number"},
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
	},
]

let dataWindow: number = 1440
let dataInterval: number = 1

const setWindow = (window: number, interval: number) => {
	dataWindow = window
	dataInterval = interval
}

let loaded = false
onMount(async () => {
	await load_host_names()
	loaded = true
})
</script>

{#if loaded}
	<section>
		<h3>Bandwidth usage and file views</h3>
	</section>
	<div class="highlight_border" style="margin-bottom: 6px;">
		<button on:click={() => setWindow(60, 1)}>Hour 1m</button>
		<button on:click={() => setWindow(720, 1)}>Half Day 1m</button>
		<button on:click={() => setWindow(1440, 1)}>Day 1m</button>
		<button on:click={() => setWindow(10080, 10)}>Week 10m</button>
		<button on:click={() => setWindow(43200, 60)}>Month 1h</button>
		<button on:click={() => setWindow(131400, 1440)}>Quarter 1d</button>
		<button on:click={() => setWindow(262800, 1440)}>Half-year 1d</button>
		<button on:click={() => setWindow(525600, 1440)}>Year 1d</button>
		<button on:click={() => setWindow(1051200, 1440)}>Two Years 1d</button>
		<button on:click={() => setWindow(2628000, 1440)}>Five Years 1d</button>
	</div>

	{#each groups as group (group.title)}
		<Expandable click_expand expanded>
			<div slot="header">
				<div class="title">{group.title}</div>
			</div>

			<div class="grid">
				{#each group.graphs as graph (graph.metric)}
					<HostMetricsGraph
						window={dataWindow}
						interval={dataInterval}
						metric={graph.metric}
						data_type={graph.data_type}
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
