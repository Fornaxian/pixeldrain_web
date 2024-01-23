<script>
import { onDestroy, onMount } from "svelte";
import { formatDataVolume, formatThousands, formatDate, formatNumber, formatDuration } from "../util/Formatting.svelte";
import Chart from "../util/Chart.svelte";
import { color_by_name } from "../util/Util.svelte";
import ServerDiagnostics from "./ServerDiagnostics.svelte";
import PeerTable from "./PeerTable.svelte";

let graphViews
let graphBandwidth
let graphTimeout = null

let start_time = ""
let end_time = ""
let total_bandwidth = 0
let total_bandwidth_paid = 0
let total_views = 0
let total_downloads = 0
const loadGraph = (minutes, interval, live) => {
	if (graphTimeout !== null) { clearTimeout(graphTimeout) }
	if (live) {
		graphTimeout = setTimeout(() => { loadGraph(minutes, interval, true) }, 10000)
	}

	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - minutes)

	fetch(
		window.api_endpoint + "/admin/files/timeseries" +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&interval=" + interval
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: " + resp.status); }
		return resp.json();
	}).then(resp => {
		resp.views.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = date.getFullYear();
			dateStr += "-" + ("00" + (date.getMonth() + 1)).slice(-2);
			dateStr += "-" + ("00" + date.getDate()).slice(-2);
			dateStr += " " + ("00" + date.getHours()).slice(-2);
			dateStr += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.views.timestamps[idx] = " " + dateStr + " "; // Poor man's padding
		});
		graphViews.data().labels = resp.views.timestamps;
		graphViews.data().datasets[0].data = resp.views.amounts;
		graphViews.data().datasets[1].data = resp.downloads.amounts;
		graphBandwidth.data().labels = resp.views.timestamps;
		graphBandwidth.data().datasets[0].data = resp.bandwidth.amounts
		graphBandwidth.data().datasets[1].data = resp.bandwidth_paid.amounts
		graphViews.update()
		graphBandwidth.update()

		start_time = resp.views.timestamps[0]
		end_time = resp.views.timestamps.slice(-1)[0];
		total_bandwidth = resp.bandwidth.amounts.reduce((acc, val) => acc + val)
		total_bandwidth_paid = resp.bandwidth_paid.amounts.reduce((acc, val) => acc + val)
		total_views = resp.views.amounts.reduce((acc, val) => acc + val)
		total_downloads = resp.downloads.amounts.reduce((acc, val) => acc + val)
	})
}

// Load performance statistics

let lastOrder;
let status = {
	cpu_profile_running_since: "",
	db_latency: 0,
	db_time: "",
	cache_threshold: 0,
	local_read_size: 0,
	local_read_size_per_sec: 0,
	local_reads: 0,
	local_reads_per_sec: 0,
	neighbour_read_size: 0,
	neighbour_read_size_per_sec: 0,
	neighbour_reads: 0,
	neighbour_reads_per_sec: 0,
	peers: [],
	query_statistics: [],
	remote_read_size: 0,
	remote_read_size_per_sec: 0,
	remote_reads: 0,
	remote_reads_per_sec: 0,
	running_since: "",
	stats_watcher_listeners: 0,
	stats_watcher_threads: 0,
	download_clients: 0,
	download_connections: 0,
}

function getStats(order) {
	lastOrder = order

	fetch(window.api_endpoint + "/status").then(
		resp => resp.json()
	).then(resp => {
		// Sort all queries by the selected sort column
		resp.query_statistics.sort((a, b) => {
			if (typeof (a[order]) === "number") {
				// Sort ints from high to low
				return b[order] - a[order]
			} else {
				// Sort strings alphabetically
				return a[order].localeCompare(b[order])
			}
		})

		// Sort individual query callers by frequency
		resp.query_statistics.forEach((v) => {
			v.callers.sort((a, b) => b.count - a.count)
		})

		status = resp
	})
}

let statsInterval = null
onMount(() => {
	// Prepare chart datasets
	graphBandwidth.data().datasets = [
		{
			label: "Bandwidth (free)",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("highlight_color"),
			backgroundColor: color_by_name("highlight_color"),
		},
		{
			label: "Bandwidth (premium)",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("danger_color"),
			backgroundColor: color_by_name("danger_color"),
		},
	];
	graphViews.data().datasets = [
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

	loadGraph(10080, 10, true);
	getStats("calls")
	statsInterval = setInterval(() => {
		getStats(lastOrder)
	}, 10000)
})
onDestroy(() => {
	if (graphTimeout !== null) {
		clearTimeout(graphTimeout)
	}
	if (statsInterval !== null) {
		clearInterval(statsInterval)
	}
})
</script>

<section>
	<h3>Bandwidth usage and file views</h3>
</section>
<div class="highlight_border" style="margin-bottom: 6px;">
	<button on:click={() => loadGraph(1440, 1, true)}>Day 1m</button>
	<button on:click={() => loadGraph(10080, 10, true)}>Week 10m</button>
	<button on:click={() => loadGraph(43200, 60, true)}>Month 1h</button>
	<button on:click={() => loadGraph(131400, 1440, false)}>Quarter 1d</button>
	<button on:click={() => loadGraph(262800, 1440, false)}>Half-year 1d</button>
	<button on:click={() => loadGraph(525600, 1440, false)}>Year 1d</button>
	<button on:click={() => loadGraph(1051200, 1440, false)}>Two Years 1d</button>
	<button on:click={() => loadGraph(2628000, 1440, false)}>Five Years 1d</button>
</div>
<Chart bind:this={graphBandwidth} data_type="bytes" tooltips={false} />
<Chart bind:this={graphViews} data_type="number" tooltips={false} />
<div class="highlight_border">
	Total usage from {start_time} to {end_time}<br/>
	{formatDataVolume(total_bandwidth, 3)} bandwidth,
	{formatDataVolume(total_bandwidth_paid, 3)} paid bandwidth,
	{formatThousands(total_views, 3)} views and
	{formatThousands(total_downloads, 3)} downloads
</div>

<br/>
<ServerDiagnostics running_since={status.cpu_profile_running_since} on:refresh={() => getStats(lastOrder)}/>
<br/>
<a class="button" href="/admin/globals">
	<i class="icon">edit</i>
	Global settings
</a>

<section>
	<table>
		<tr>
			<td>DB Time</td>
			<td>{formatDate(new Date(status.db_time), true, true, true)}</td>
			<td>DB Latency</td>
			<td>{formatNumber(status.db_latency / 1000, 3)} ms</td>
		</tr>
	</table>

	<h3>Cache nodes</h3>
	<PeerTable peers={status.peers.reduce((acc, val) => {if (val.role === "cache") {acc.push(val)}; return acc}, [])}/>

	<h3>Storage nodes</h3>
	<PeerTable peers={status.peers.reduce((acc, val) => {if (val.role === "storage") {acc.push(val)}; return acc}, [])}/>

	<h3>Pixelstore stats</h3>
	<table>
		<thead>
			<tr>
				<td>Source</td>
				<td>Reads</td>
				<td>Reads / s</td>
				<td>Total size</td>
				<td>Size / s</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Local cache</td>
				<td>{status.local_reads}</td>
				<td>{status.local_reads_per_sec.toPrecision(4)}/s</td>
				<td>{formatDataVolume(status.local_read_size, 4)}</td>
				<td>{formatDataVolume(status.local_read_size_per_sec, 4)}/s</td>
			</tr>
			<tr>
				<td>Neighbour</td>
				<td>{status.neighbour_reads}</td>
				<td>{status.neighbour_reads_per_sec.toPrecision(4)}/s</td>
				<td>{formatDataVolume(status.neighbour_read_size, 4)}</td>
				<td>{formatDataVolume(status.neighbour_read_size_per_sec, 4)}/s</td>
			</tr>
			<tr>
				<td>Reed-solomon</td>
				<td>{status.remote_reads}</td>
				<td>{status.remote_reads_per_sec.toPrecision(4)}/s</td>
				<td>{formatDataVolume(status.remote_read_size, 4)}</td>
				<td>{formatDataVolume(status.remote_read_size_per_sec, 4)}/s</td>
			</tr>
		</tbody>
	</table>
	<p>
		Cache threshold: {status.cache_threshold.toFixed(3)}
	</p>

	<h3>Socket statistics</h3>
	<table>
		<thead>
			<tr>
				<td>Watcher</td>
				<td>Threads</td>
				<td>Listeners</td>
				<td>Avg</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>File statistics</td>
				<td>{status.stats_watcher_threads}</td>
				<td>{status.stats_watcher_listeners}</td>
				<td>{(status.stats_watcher_listeners / status.stats_watcher_threads).toPrecision(3)}</td>
			</tr>
			<tr>
				<td>Downloads</td>
				<td>{status.download_clients}</td>
				<td>{status.download_connections}</td>
				<td>{(status.download_connections / status.download_clients).toPrecision(3)}</td>
			</tr>
		</tbody>
	</table>
	<h3>Query statistics</h3>
	<div class="table_scroll" style="text-align: left;">
		<table>
			<thead>
				<tr>
					<td>
						<button on:click={() => { getStats('query_name') }}>
							Query
						</button>
					</td>
					<td>
						<button style="cursor: pointer;" on:click={() => { getStats('calls') }}>
							Calls
						</button>
					</td>
					<td>
						<button style="cursor: pointer;" on:click={() => { getStats('average_duration') }}>
							Avg
						</button>
					</td>
					<td>
						<button style="cursor: pointer;" on:click={() => { getStats('total_duration') }}>
							Total
						</button>
					</td>
					<td>Callers</td>
				</tr>
			</thead>
			<tbody id="tstat_body">
				{#each status.query_statistics as q}
					<tr>
						<td>{q.query_name}</td>
						<td>{q.calls}</td>
						<td>{q.average_duration}ms</td>
						<td>{formatDuration(q.total_duration, 0)}</td>
						<td>
							{#each q.callers as caller}
								{caller.count}x {caller.name}<br/>
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
