<script>
import { onDestroy, onMount } from "svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte";
import Chart from "../util/Chart.svelte";
import StorageProgressBar from "./StorageProgressBar.svelte";
import HotlinkProgressBar from "./HotlinkProgressBar.svelte";
import Euro from "../util/Euro.svelte"
import { color_by_name } from "../util/Util.svelte";

let graph_views_downloads = null
let graph_bandwidth = null
let time_start = ""
let time_end = ""

let load_graphs = async (minutes, interval) => {
	let end = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes() - minutes)

	try {
		let views = get_graph_data("views", start, end, interval);
		let downloads = get_graph_data("downloads", start, end, interval);
		let bandwidth = get_graph_data("bandwidth", start, end, interval);
		let transfer_paid = get_graph_data("transfer_paid", start, end, interval);
		let transfer_kickback = get_graph_data("transfer_kickback", start, end, interval);
		views = await views
		downloads = await downloads
		bandwidth = await bandwidth
		transfer_paid = await transfer_paid
		transfer_kickback = await transfer_kickback

		graph_views_downloads.data().labels = views.timestamps;
		graph_views_downloads.data().datasets[0].data = views.amounts
		graph_views_downloads.data().datasets[1].data = downloads.amounts
		graph_bandwidth.data().labels = bandwidth.timestamps;
		graph_bandwidth.data().datasets[0].data = bandwidth.amounts
		graph_bandwidth.data().datasets[1].data = transfer_paid.amounts
		graph_bandwidth.data().datasets[2].data = transfer_kickback.amounts

		graph_views_downloads.update()
		graph_bandwidth.update()

		time_start = views.timestamps[0];
		time_end = views.timestamps.slice(-1)[0];
	} catch (err) {
		console.error("Failed to update graphs", err)
		return
	}
}

let total_views = 0
let total_downloads = 0
let total_bandwidth = 0
let total_transfer_paid = 0
let total_transfer_kickback = 0

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
	} else if (stat == "transfer_kickback") {
		total_transfer_kickback = total;
	}

	return resp
}

let graph_timeout = null
let graph_timespan = 0
let update_graphs = (minutes, interval, live) => {
	if (graph_timeout !== null) { clearTimeout(graph_timeout) }
	if (live) {
		graph_timeout = setTimeout(() => { update_graphs(minutes, interval, true) }, 6000)
	}

	graph_timespan = minutes

	load_graphs(minutes, interval)
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

let patreon_response = ""

onMount(() => {
	if (window.location.hash.startsWith("#patreon_")) {
		patreon_response = window.location.hash.replace("#patreon_", "")
		window.location.hash = ""
	}

	if (window.user.monthly_transfer_cap > 0) {
		transfer_cap = window.user.monthly_transfer_cap
	} else if (window.user.subscription.monthly_transfer_cap > 0) {
		transfer_cap = window.user.subscription.monthly_transfer_cap
	} else {
		transfer_cap = -1
	}

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
			label: "Total bandwidth",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("chart_1_color"),
			backgroundColor: color_by_name("chart_1_color"),
		},
		{
			label: "Premium bandwidth",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("chart_2_color"),
			backgroundColor: color_by_name("chart_2_color"),
		},
		{
			label: "Kickback bandwidth",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: color_by_name("chart_3_color"),
			backgroundColor: color_by_name("chart_3_color"),
		},
	];

	update_graphs(10080, 60, true);
})
onDestroy(() => {
	if (graph_timeout !== null) {
		clearTimeout(graph_timeout)
	}
})
</script>

<section>
	{#if patreon_response !== ""}
		{#if patreon_response === "error"}
			<div class="highlight_red">
				An error occurred while linking Patreon subscription. Please try
				again later.
			</div>
		{:else if patreon_response === "pledge_not_found"}
			<div class="highlight_yellow">
				<p>
					We were not able to find your payment on Patreon. Please
					wait until the payment is confirmed and try again. You can
					see the status of your payment <a
					href="https://www.patreon.com/pledges?ty=h"
					target="_blank">on Patreon itself</a>.
				</p>
				<p>
					If your payment is complete and your account is still not
					upgraded please contact me at support@pixeldrain.com, or
					send me a message on Patreon.
				<p/>
			</div>
		{:else if patreon_response === "success"}
			<div class="highlight_green">
				Success! Your Patreon pledge has been linked to your pixeldrain
				account. You are now able to use Pro features.
			</div>
		{/if}
		<br/>
	{/if}

	<h2>Account information</h2>
	<ul>
		<li>Username: {window.user.username}</li>
		<li>E-mail address: {window.user.email}</li>
		<li>
			Supporter level: {window.user.subscription.name}
			{#if window.user.subscription.type === "patreon"}
				(<a href="https://www.patreon.com/join/pixeldrain/checkout?edit=1">Manage subscription</a>)
			{:else if window.user.subscription.id === ""}
				(<a href="/api/patreon_auth/start" class="button">Link Patreon subscription</a>)
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
		Here you can see how often your files are viewed, downloaded and how
		much bandwidth they consume. The buttons below can be pressed to adjust
		the timeframe.
	</p>

	<div class="highlight_shaded">
		<button
			on:click={() => update_graphs(1440, 1, true)}
			class:button_highlight={graph_timespan == 1440}>
			Day (1m)
		</button>
		<button
			on:click={() => update_graphs(10080, 60, true)}
			class:button_highlight={graph_timespan == 10080}>
			Week (1h)
		</button>
		<button
			on:click={() => update_graphs(20160, 60, true)}
			class:button_highlight={graph_timespan == 20160}>
			Two Weeks (1h)
		</button>
		<button
			on:click={() => update_graphs(43200, 1440, false)}
			class:button_highlight={graph_timespan == 43200}>
			Month (1d)
		</button>
		<button
			on:click={() => update_graphs(131400, 1440, false)}
			class:button_highlight={graph_timespan == 131400}>
			Quarter (1d)
		</button>
		<button
			on:click={() => update_graphs(525600, 1440, false)}
			class:button_highlight={graph_timespan == 525600}>
			Year (1d)
		</button>
		<button
			on:click={() => update_graphs(1051200, 1440, false)}
			class:button_highlight={graph_timespan == 1051200}>
			Two Years (1d)
		</button>
	</div>

	<h3>Premium transfers and total bandwidth usage</h3>
	<p>
		Total bandwidth usage is the combined bandwidth usage of all the files
		on your account. This includes paid transfers.
	</p>
	<p>
		A premium transfer is when a file is downloaded using the data cap on
		your subscription plan. These can be files you downloaded from other
		people, or other people downloading your files if you have bandwidth
		sharing enabled. Bandwidth sharing can be changed on
		<a href="/user/subscription">the subscription page</a>.
	</p>
	<p>
		Kickback bandwidth is counted when a paying pixeldrain user downloads
		one of your files using their data cap. If you are on a prepaid plan
		this usage will be compensated at a rate of €1 per TB. When this happens
		a positive transaction will be logged on the
		<a href="/user/transactions">transactions page</a>.
	</p>
</section>

<Chart bind:this={graph_bandwidth} data_type="bytes"/>

<section>
	<div class="highlight_shaded">
		Total usage from {time_start} to {time_end}<br/>
		{formatDataVolume(total_bandwidth, 3)} bandwidth,
		{formatDataVolume(total_transfer_paid, 3)} paid transfers
		{formatDataVolume(total_transfer_kickback, 3)} kickback transfers
	</div>

	<h3>Views and downloads</h3>
	<p>
		A view is counted when someone visits the download page of one of
		your files. Views are unique per user per file.
	</p>
	<p>
		Downloads are counted when a user clicks the download button on one
		of your files. It does not matter whether the download is completed
		or not, only the start of the download is counted.
	</p>
</section>

<Chart bind:this={graph_views_downloads} data_type="number"/>

<section>
	<div class="highlight_shaded">
		Total usage from {time_start} to {time_end}<br/>
		{formatThousands(total_views)} views and
		{formatThousands(total_downloads)} downloads
	</div>
</section>
