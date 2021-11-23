<script>
import { onDestroy, onMount } from "svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte";
import Chart from "../util/Chart.svelte";
import StorageProgressBar from "./StorageProgressBar.svelte";
import HotlinkProgressBar from "./HotlinkProgressBar.svelte";
import Euro from "../util/Euro.svelte"

let graph_view = null
let graph_download = null
let graph_bandwidth = null
let graph_transfer_paid = null
let time_start = ""
let time_end = ""
let total_views = 0
let total_downloads = 0
let total_bandwidth = 0
let total_transfer_paid = 0

let load_graph = (graph, stat, minutes, interval) => {
	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - minutes)

	fetch(
		window.api_endpoint + "/user/time_series/" + stat +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&interval=" + interval
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: " + resp.status); }
		return resp.json();
	}).then(resp => {
		resp.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = ("00" + (date.getMonth() + 1)).slice(-2);
			dateStr += "-" + ("00" + date.getDate()).slice(-2);
			dateStr += " " + ("00" + date.getHours()).slice(-2);
			dateStr += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.timestamps[idx] = "   " + dateStr + "   "; // Poor man's padding
		});
		graph.chart().data.labels = resp.timestamps;
		graph.chart().data.datasets[0].data = resp.amounts;
		graph.chart().update();

		time_start = resp.timestamps[0];
		time_end = resp.timestamps.slice(-1)[0];

		let total = resp.amounts.reduce((acc, cur) => { return acc + cur }, 0)

		if (stat == "views") {
			total_views = total;
		} else if (stat == "downloads") {
			total_downloads = total;
		} else if (stat == "bandwidth") {
			total_bandwidth = total;
		} else if (stat == "transfer_paid") {
			total_transfer_paid = total;
		}
	}).catch(e => {
		console.error("Error requesting time series: " + e);
	})
}

let graph_timeout = null
let graph_timespan = 0
let update_graphs = (minutes, interval, live) => {
	if (graph_timeout !== null) { clearTimeout(graph_timeout) }
	if (live) {
		graph_timeout = setTimeout(() => { update_graphs(minutes, interval, true) }, 6000)
	}

	graph_timespan = minutes

	load_graph(graph_view, "views", minutes, interval)
	load_graph(graph_download, "downloads", minutes, interval)
	load_graph(graph_bandwidth, "bandwidth", minutes, interval)
	load_graph(graph_transfer_paid, "transfer_paid", minutes, interval)
	load_direct_bw()
}

let transfer_cap = 0
let transfer_used = 0
let storage_space_used = 0
let load_direct_bw = () => {
	let today = new Date()
	let start = new Date()
	start.setDate(start.getDate() - 30)

	fetch(
		window.api_endpoint + "/user/time_series/transfer_paid" +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&interval=60"
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: " + resp.status); }
		return resp.json();
	}).then(resp => {
		let total = resp.amounts.reduce((accum, val) => accum += val, 0);
		transfer_used = total
		storage_space_used = window.user.storage_space_used
	}).catch(e => {
		console.error("Error requesting time series: " + e);
	})
}

onMount(() => {
	if (window.user.monthly_transfer_cap > 0) {
		transfer_cap = window.user.monthly_transfer_cap
	} else if (window.user.subscription.monthly_transfer_cap > 0) {
		transfer_cap = window.user.subscription.monthly_transfer_cap
	} else {
		transfer_cap = -1
	}

	update_graphs(1440, 1, true);
})
onDestroy(() => {
	if (graph_timeout !== null) {
		clearTimeout(graph_timeout)
	}
})
</script>

<div>
	<div class="limit_width">
		<h2>Account information</h2>
		<ul>
			<li>Username: {window.user.username}</li>
			<li>E-mail address: {window.user.email}</li>
			<li>
				Supporter level: {window.user.subscription.name}
				{#if window.user.subscription.type === "patreon"}
					(<a href="https://www.patreon.com/join/pixeldrain/checkout?edit=1">Manage subscription</a>)
				{/if}
				<ul>
					<li>
						Max file size: {formatDataVolume(window.user.subscription.file_size_limit, 3)}
					</li>
					{#if window.user.subscription.file_expiry_days > 0}
						<li>Files expire after {window.user.subscription.file_expiry_days} days</li>
					{:else}
						<li>Files never expire</li>
					{/if}
				</ul>
			</li>
			{#if window.user.balance_micro_eur !== 0}
				<li>
					Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro>
				</li>
			{/if}
		</ul>

		<div class="indent">
			{#if window.user.subscription.storage_space === -1}
				Storage space used: {formatDataVolume(storage_space_used, 3)}<br/>
			{:else}
				<StorageProgressBar used={storage_space_used} total={window.user.subscription.storage_space}></StorageProgressBar>
			{/if}

			{#if transfer_cap === -1}
				Paid transfers in the last 30 days: {formatDataVolume(transfer_used, 3)}<br/>
			{:else}
				Paid transfers:
				{formatDataVolume(transfer_used, 3)}
				out of
				{formatDataVolume(transfer_cap, 3)}
				(<a href="/user/subscription">Set your transfer limit on the subscription page</a>)
				<HotlinkProgressBar used={transfer_used} total={transfer_cap}></HotlinkProgressBar>
			{/if}
		</div>

		<h3>Exports</h3>
		<div style="text-align: center;">
			<a href="/user/export/files" class="button">
				<i class="icon">list</i>
				Export uploaded files to CSV
			</a>
			<a href="/user/export/lists" class="button">
				<i class="icon">list</i>
				Export created lists to CSV
			</a>
		</div>

		<h2>Statistics</h2>
		<p>
			Here you can see how often your files are viewed, downloaded
			and how much bandwidth they consume. The buttons at the top
			can be pressed to adjust the timeframe. If you choose 'Day'
			the statistics will be updated periodically. No need to
			refresh the page.
		</p>
	</div>
	<div class="highlight_light">
		<button
			on:click={() => { update_graphs(1440, 1, true) }}
			class:button_highlight={graph_timespan == 1440}>
			Day (1m)
		</button>
		<button
			on:click={() => { update_graphs(10080, 10, false) }}
			class:button_highlight={graph_timespan == 10080}>
			Week (10m)
		</button>
		<button
			on:click={() => { update_graphs(20160, 60, false) }}
			class:button_highlight={graph_timespan == 20160}>
			Two Weeks (1h)
		</button>
		<button
			on:click={() => { update_graphs(43200, 1440, false) }}
			class:button_highlight={graph_timespan == 43200}>
			Month (1d)
		</button>
		<button
			on:click={() => { update_graphs(131400, 1440, false) }}
			class:button_highlight={graph_timespan == 131400}>
			Quarter (1d)
		</button>
		<button
			on:click={() => { update_graphs(525600, 1440, false) }}
			class:button_highlight={graph_timespan == 525600}>
			Year (1d)
		</button>
		<button
			on:click={() => { update_graphs(1051200, 1440, false) }}
			class:button_highlight={graph_timespan == 1051200}>
			Two Years (1d)
		</button>
		<br/>
		Total usage from {time_start} to {time_end}<br/>
		{formatThousands(total_views)} views,
		{formatThousands(total_downloads)} downloads,
		{formatDataVolume(total_bandwidth, 3)} bandwidth and
		{formatDataVolume(total_transfer_paid, 3)} paid transfers
	</div>
	<div class="limit_width">
		<h3>Paid transfers</h3>
		<p>
			A paid transfer is when a file is downloaded using the data cap on
			your subscription plan. These can be files you downloaded from other
			people, or other people downloading your files if you have bandwidth
			sharing enabled. Bandwidth sharing can be changed on
			<a href="/user/subscription">the subscription page</a>.
		</p>
	</div>
	<Chart bind:this={graph_transfer_paid} dataType="bytes" label="Paid transfers" />
	<div class="limit_width">
		<h3>Views</h3>
		<p>
			A view is counted when someone visits the download page of one
			of your files. Views are unique per user per file.
		</p>
	</div>
	<Chart bind:this={graph_view} dataType="number" label="Views" />
	<div class="limit_width">
		<h3>Downloads</h3>
		<p>
			Downloads are counted when a user clicks the download button
			on one of your files. It does not matter whether the
			download is completed or not, only the start of the download
			is counted.
		</p>
	</div>
	<Chart bind:this={graph_download} dataType="number" label="Downloads" />
	<div class="limit_width">
		<h3>Bandwidth</h3>
		<p>
			This is how much bandwidth your files are using in total.
			Bandwidth is used when a file is tranferred from a
			pixeldrain server to a user who is downloading the file.
			When a 5 MB file is downloaded 8 times it has used 40 MB of
			bandwidth.
		</p>
	</div>
	<Chart bind:this={graph_bandwidth} dataType="bytes" label="Bandwidth" />
</div>
