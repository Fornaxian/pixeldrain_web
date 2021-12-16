<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate, formatThousands } from "../util/Formatting.svelte"
import { domain_url } from "../util/Util.svelte";
import Chart from "../util/Chart.svelte";

export let file = {
	id: "",
	name: "",
	mime_type: "",
	date_created: "",
	size: 0,
	downloads: 0,
	bandwidth_used: 0,
	bandwidth_used_paid: 0,
	description: "",
	timeseries_href: "",
}

let chart
let chart_timespan = 43200
let chart_interval = 60

$: update_file(file.id)
let update_file = id => {
	if (id) {
		update_chart(chart_timespan, chart_interval)
	}
}

let update_chart = (timespan, interval) => {
	chart_timespan = timespan
	chart_interval = interval

	console.log("updating graph")

	let start = new Date()
	start.setMinutes(start.getMinutes() - timespan)
	let end = new Date()

	fetch(
		file.timeseries_href +
		"?start=" + start.toISOString() +
		"&end=" + end.toISOString() +
		"&interval=" + interval
	).then(resp => {
		if (!resp.ok) { return null }
		return resp.json()
	}).then(resp => {
		resp.views.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let str = ("00" + (date.getMonth() + 1)).slice(-2);
			str += "-" + ("00" + date.getDate()).slice(-2);
			str += " " + ("00" + date.getHours()).slice(-2);
			str += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.views.timestamps[idx] = "  " + str + "  "; // Poor man's padding
		});
		resp.bandwidth.amounts.forEach((val, idx) => {
			resp.bandwidth.amounts[idx] = Math.round(val / file.size);
		});
		resp.bandwidth_paid.amounts.forEach((val, idx) => {
			resp.bandwidth.amounts[idx] += Math.round(val / file.size);
		});
		chart.data().labels = resp.views.timestamps
		chart.data().datasets[0].data = resp.views.amounts
		chart.data().datasets[1].data = resp.bandwidth.amounts
		chart.update()
	})
}

onMount(() => {
	chart.data().datasets = [
		{
			label: "Views",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: "#"+window.style.highlightColor,
			backgroundColor: "#"+window.style.highlightColor,
		},
		{
			label: "Downloads",
			borderWidth: 2,
			pointRadius: 0,
			borderColor: "#"+window.style.dangerColor,
			backgroundColor: "#"+window.style.dangerColor,
		},
	];
})
</script>

<div>
	<table>
		<tr>
			<td>Name</td>
			<td>{file.name}</td>
		</tr>
		<tr>
			<td>URL</td>
			<td><a href="/u/{file.id}">{domain_url()}/u/{file.id}</a></td>
		</tr>
		<tr>
			<td>Mime Type</td>
			<td>{file.mime_type}</td>
		</tr>
		<tr>
			<td>ID</td>
			<td>{file.id}</td>
		</tr>
		<tr>
			<td>Size</td>
			<td>{formatDataVolume(file.size, 4)} ( {formatThousands(file.size)} B )</td>
		</tr>
		<tr>
			<td>Free bandwidth used</td>
			<td>
				{formatDataVolume(file.bandwidth_used, 4)}
				( {formatThousands(file.bandwidth_used)} B ),
				{(file.bandwidth_used/file.size).toFixed(1)}x file size
			</td>
		</tr>
		<tr>
			<td>Premium bandwidth used</td>
			<td>
				{formatDataVolume(file.bandwidth_used_paid, 4)}
				( {formatThousands(file.bandwidth_used_paid)} B ),
				{(file.bandwidth_used_paid/file.size).toFixed(1)}x file size
			</td>
		</tr>
		<tr style="border-bottom: none">
			<td>Unique downloads</td>
			<td>{formatThousands(file.downloads)}</td>
		</tr>
		<tr>
			<td colspan="2">
				The unique download counter only counts downloads once per IP
				address. So this number shows how many individual people have
				attempted to download the file. The download counter on the
				toolbar on the other hand shows how many real downloads the file
				has had. Real downloads are counted by dividing the total
				bandwidth usage by the size of the file.
			</td>
		</tr>
		<tr>
			<td>Upload Date</td>
			<td>{formatDate(file.date_upload, true, true, true)}</td>
		</tr>
		{#if file.description}
			<tr>
				<td>Description</td>
				<td>{file.description}</td>
			</tr>
		{/if}
	</table>

	<h2>Views and downloads</h2>

	<div class="button_bar">
		<button
			on:click={() => { update_chart(1440, 1) }}
			class:button_highlight={chart_timespan == 1440}>
			Day (1m)
		</button>
		<button
			on:click={() => { update_chart(10080, 60) }}
			class:button_highlight={chart_timespan == 10080}>
			Week (1h)
		</button>
		<button
			on:click={() => { update_chart(43200, 60) }}
			class:button_highlight={chart_timespan == 43200}>
			Month (1h)
		</button>
		<button
			on:click={() => { update_chart(131400, 1440) }}
			class:button_highlight={chart_timespan == 131400}>
			Quarter (1d)
		</button>
		<button
			on:click={() => { update_chart(525600, 1440) }}
			class:button_highlight={chart_timespan == 525600}>
			Year (1d)
		</button>
		<button
			on:click={() => { update_chart(1051200, 1440) }}
			class:button_highlight={chart_timespan == 1051200}>
			Two Years (1d)
		</button>
	</div>

	<Chart bind:this={chart} />

	<p style="text-align: center">
		Charts rendered by the amazing <a href="https://www.chartjs.org/" target="_blank">Chart.js</a>.
	</p>

	<h3>About</h3>
	<p>
		Pixeldrain is a file sharing platform.
		<a href="/" target="_blank">Visit the home page for more information.</a>
	</p>

	<h3>Keyboard Controls</h3>
	<table style="max-width: 100%;">
		<tr><td colspan="2">File Shortcuts</td></tr>
		<tr><td>c</td><td> = Copy URL of this page</td></tr>
		<tr><td>i</td><td> = Toggle details window (this window) (<b><u>i</u></b>nfo)</td></tr>
		<tr><td>s</td><td> = Download the file you are currently viewing (<b><u>s</u></b>ave)</td></tr>
		<tr><td>q</td><td> = Close the window (<b><u>q</u></b>uit)</td></tr>
		<tr><td colspan="2">List Shortcuts</td></tr>
		<tr><td>a or &#8592;</td><td> = View previous item in list</td></tr>
		<tr><td>d or &#8594;</td><td> = View next item in list</td></tr>
		<tr><td>r</td><td> = Toggle shuffle (<b><u>r</u></b>andom)</td></tr>
		<tr><td>SHIFT + s</td><td> = Download all the files in the list as a zip archive</td></tr>
	</table>
</div>

<style>
.button_bar {
	display: block;
	width: 100%;
	text-align: center;
}
</style>
