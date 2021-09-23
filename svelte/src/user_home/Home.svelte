<script>
import { onDestroy, onMount } from "svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte";
import Chart from "../util/Chart.svelte";

let graph_view = null
let graph_download = null
let graph_bandwidth = null
let graph_direct_link = null
let time_start = ""
let time_end = ""
let total_views = 0
let total_downloads = 0
let total_bandwidth = 0
let total_direct_link = 0

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
		} else if (stat == "direct_bandwidth") {
			total_direct_link = total;
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
		graph_timeout = setTimeout(() => { update_graphs(minutes, interval, true) }, 10000)
	}

	graph_timespan = minutes

	load_graph(graph_view, "views", minutes, interval)
	load_graph(graph_download, "downloads", minutes, interval)
	load_graph(graph_bandwidth, "bandwidth", minutes, interval)
	load_graph(graph_direct_link, "direct_bandwidth", minutes, interval)
	load_direct_bw()
}

let direct_link_bandwidth_used = 0
let direct_link_percent = 0
let storage_space_used = 0
let storage_percent = 0
let load_direct_bw = () => {
	let today = new Date()
	let start = new Date()
	start.setDate(start.getDate() - 30)

	fetch(
		window.api_endpoint + "/user/time_series/direct_bandwidth" +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&interval=60"
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: " + resp.status); }
		return resp.json();
	}).then(resp => {
		let total = resp.amounts.reduce((accum, val) => accum += val, 0);
		direct_link_bandwidth_used = total
		direct_link_percent = total / window.user.subscription.direct_linking_bandwidth
		storage_space_used = window.user.storage_space_used
		storage_percent = window.user.storage_space_used / window.user.subscription.storage_space
	}).catch(e => {
		console.error("Error requesting time series: " + e);
	})
}

onMount(() => {
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
						Advertisements when viewing files:
						{#if window.user.subscription.disable_ad_display}No{:else}Yes{/if}
					</li>
					<li>
						Advertisements on your uploaded files:
						{#if window.user.subscription.disable_ads_on_files}No{:else}Yes{/if}
					</li>
					{#if window.user.subscription.file_expiry_days > 0}
						<li>Files expire after {window.user.subscription.file_expiry_days} days</li>
					{:else}
						<li>Files never expire</li>
					{/if}
				</ul>
			</li>
		</ul>

		Storage:
		{formatDataVolume(storage_space_used, 3)}
		out of
		{formatDataVolume(window.user.subscription.storage_space, 3)}
		<br/>
		<div class="progress_bar_outer">
			<div id="storage_progress" class="progress_bar_inner" style="width: {storage_percent*100}%;"></div>
		</div>
		<br/>
		Direct link bandwidth:
		{formatDataVolume(direct_link_bandwidth_used, 3)}
		out of
		{formatDataVolume(window.user.subscription.direct_linking_bandwidth, 3)}
		(<a href="/#direct_linking">More information about direct linking</a>)
		<br/>
		<div class="progress_bar_outer">
			<div id="direct_bandwidth_progress" class="progress_bar_inner" style="width: {direct_link_percent*100}%;"></div>
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
		{formatDataVolume(total_direct_link, 3)} direct link bandwidth
	</div>
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
	<div class="limit_width">
		<h3>Direct link bandwidth</h3>
		<p>
			When a file is downloaded without going through pixeldrain's
			download page it counts as a direct download. Because direct
			downloads cost us bandwidth and don't generate any ad
			revenue we have to limit them. When your direct link
			bandwidth runs out people will be asked to do a test before
			they can download your files. See our
			<a href="/#pro">subscription options</a> to get more direct
			linking bandwidth.
		</p>
	</div>
	<Chart bind:this={graph_direct_link} dataType="bytes" label="Direct link bandwidth" />
</div>

<style>
.progress_bar_outer {
	background-color: var(--layer_1_color);
	width: 100%;
	height: 3px;
}
.progress_bar_inner {
	background-color: var(--highlight_color);
	height: 100%;
	width: 0;
	transition: width 1s;
}
</style>
