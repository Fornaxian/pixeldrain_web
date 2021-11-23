<script>
import { onDestroy, onMount } from "svelte";
import { formatDataVolume, formatThousands, formatDate, formatNumber, formatDuration } from "../util/Formatting.svelte";
import Chart from "../util/Chart.svelte";

let graphViews
let graphBandwidth
let graphBandwidthPaid
let graphTimeout = null

let start_time = ""
let end_time = ""
let total_bandwidth = 0
let total_views = 0
let total_bandwidth_paid = 0
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
			let dateStr = ("00" + (date.getMonth() + 1)).slice(-2);
			dateStr += "-" + ("00" + date.getDate()).slice(-2);
			dateStr += " " + ("00" + date.getHours()).slice(-2);
			dateStr += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.views.timestamps[idx] = "   " + dateStr + "   "; // Poor man's padding
		});
		graphViews.chart().data.labels = resp.views.timestamps;
		graphViews.chart().data.datasets[0].data = resp.views.amounts;
		graphBandwidth.chart().data.labels = resp.views.timestamps;
		graphBandwidth.chart().data.datasets[0].data = resp.bandwidth.amounts;
		graphBandwidthPaid.chart().data.labels = resp.views.timestamps;
		graphBandwidthPaid.chart().data.datasets[0].data = resp.bandwidth_paid.amounts;
		graphViews.update()
		graphBandwidth.update()
		graphBandwidthPaid.update()

		start_time = resp.views.timestamps[0]
		end_time = resp.views.timestamps.slice(-1)[0];
		total_bandwidth = resp.bandwidth.amounts.reduce((acc, val) => acc + val)
		total_views = resp.views.amounts.reduce((acc, val) => acc + val)
		total_bandwidth_paid = resp.bandwidth_paid.amounts.reduce((acc, val) => acc + val)
	})
}

// Load performance statistics

let lastOrder;
let status = {
  db_latency: 0,
  db_time: "",
  local_read_size: 0,
  local_read_size_per_sec: 0,
  local_reads: 0,
  local_reads_per_sec: 0,
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
	loadGraph(10080, 10, false);
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

<div>
	<div class="limit_width">
		<h3>Bandwidth, paid transfers and views</h3>
	</div>
	<div class="highlight_dark" style="margin-bottom: 6px;">
		<button on:click={() => { loadGraph(1440, 1, true) }}>Day</button>
		<button on:click={() => { loadGraph(10080, 10, false) }}>Week</button>
		<button on:click={() => { loadGraph(20160, 60, false) }}>Two Weeks</button>
		<button on:click={() => { loadGraph(43200, 60, false) }}>Month</button>
		<button on:click={() => { loadGraph(131400, 1440, false) }}>Quarter</button>
		<button on:click={() => { loadGraph(262800, 1440, false) }}>Half-year</button>
		<button on:click={() => { loadGraph(525600, 1440, false) }}>Year</button>
		<button on:click={() => { loadGraph(1051200, 1440, false) }}>Two Years</button>
	</div>
	<Chart bind:this={graphBandwidth} dataType="bytes" label="Bandwidth" />
	<hr/>
	<Chart bind:this={graphBandwidthPaid} dataType="bytes" label="Paid bandwidth" />
	<hr/>
	<Chart bind:this={graphViews} dataType="number" label="Views" />
	<div class="highlight_dark">
		Total usage from {start_time} to {end_time}<br/>
		{formatDataVolume(total_bandwidth, 3)} bandwidth,
		{formatDataVolume(total_bandwidth_paid, 3)} paid bandwidth and
		{formatThousands(total_views, 3)} views
	</div>

	<br/>
	<a class="button" href="/api/admin/call_stack">Call stack</a>
	<a class="button" href="/api/admin/heap_profile">Heap profile</a>
	<a class="button" href="/api/admin/cpu_profile">CPU profile (wait 1 min)</a>
	<br/>

	<div class="limit_width">
		<table>
			<tr>
				<td>DB Time</td>
				<td>{formatDate(new Date(status.db_time), true, true, true)}</td>
				<td>DB Latency</td>
				<td>{formatNumber(status.db_latency / 1000, 3)} ms</td>
			</tr>
		</table>
		<h3>Pixelstore peers</h3>
		<div class="table_scroll">
			<table>
				<thead>
					<tr>
						<td>Address</td>
						<td>Pos</td>
						<td>Alive</td>
						<td>Err</td>
						<td>1m</td>
						<td>5m</td>
						<td>15m</td>
						<td>Ping</td>
						<td>Free</td>
						<td>Min free</td>
					</tr>
				</thead>
				<tbody>
					{#each status.peers as peer}
					<tr class="peer_row"
						class:highlight_red={peer.free_space < peer.min_free_space / 2 || !peer.reachable}
						class:highlight_yellow={peer.free_space < peer.min_free_space}
						class:highlight_green={peer.reachable}
					>
						<td>{peer.address}</td>
						<td>{peer.position}</td>
						<td>{peer.reachable}</td>
						<td>{peer.unreachable_count}</td>
						<td>{peer.load_1_min.toFixed(1)}</td>
						<td>{peer.load_5_min.toFixed(1)}</td>
						<td>{peer.load_15_min.toFixed(1)}</td>
						<td>{formatDuration(peer.latency, 3)}</td>
						<td>{formatDataVolume(peer.free_space, 4)}</td>
						<td>{formatDataVolume(peer.min_free_space, 3)}</td>
					</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<h3>Pixelstore stats</h3>
		<table>
			<thead>
				<tr>
					<td>Local reads</td>
					<td>Local read size</td>
					<td>Remote reads</td>
					<td>Remote read size</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{status.local_reads}</td>
					<td>{formatDataVolume(status.local_read_size, 4)}</td>
					<td>{status.remote_reads}</td>
					<td>{formatDataVolume(status.remote_read_size, 4)}</td>
				</tr>
				<tr>
					<td>{status.local_reads_per_sec.toPrecision(4)} / s</td>
					<td>{formatDataVolume(status.local_read_size_per_sec, 4)} / s</td>
					<td>{status.remote_reads_per_sec.toPrecision(4)} / s</td>
					<td>{formatDataVolume(status.remote_read_size_per_sec, 4)} /s</td>
				</tr>
			</tbody>
		</table>
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
						<td style="cursor: pointer;" on:click={() => { getStats('query_name') }}>Query</td>
						<td style="cursor: pointer;" on:click={() => { getStats('calls') }}>Calls</td>
						<td style="cursor: pointer;" on:click={() => { getStats('average_duration') }}>Avg dur</td>
						<td style="cursor: pointer;" on:click={() => { getStats('total_duration') }}>Total dur</td>
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
	</div>
</div>

<style>
.peer_row {
	text-align: left;
}
</style>
