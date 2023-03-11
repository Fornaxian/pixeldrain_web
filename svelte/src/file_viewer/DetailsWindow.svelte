<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate, formatThousands } from "../util/Formatting.svelte"
import { color_by_name, domain_url } from "../util/Util.svelte";
import Chart from "../util/Chart.svelte";

export let file = {
	id: "",
	name: "",
	mime_type: "",
	date_upload: "",
	size: 0,
	downloads: 0,
	bandwidth_used: 0,
	bandwidth_used_paid: 0,
	description: "",
	hash_sha256: "",
	timeseries_href: "",
}

$: update_file(file.id)
let update_file = id => {
	if (id) {
		update_chart(0, 0)
	}
}

let chart
let chart_timespan = 0
let chart_interval = 0
let chart_timespans = [
	{label: "Day (1m)", span: 1440, interval: 1},
	{label: "Week (1h)", span: 10080, interval: 60},
	{label: "Month (1h)", span: 43200, interval: 60},
	{label: "Quarter (1d)", span: 131400, interval: 1440},
	{label: "Year (1d)", span: 525600, interval: 1440},
	{label: "Two Years (1d)", span: 1051200, interval: 1440},
	{label: "Five Years (1d)", span: 2628000, interval: 1440},
]

let update_chart = (timespan, interval) => {
		// If the timespan is 0 we calculate the maximum timespan based on the age
	// of the file
	if (timespan === 0) {
		let minutes_since_upload = (new Date().getTime() - Date.parse(file.date_upload)) / 1000 / 60

		for (let i = 0; i < chart_timespans.length; i++) {
			timespan = chart_timespans[i].span
			interval = chart_timespans[i].interval

			if (chart_timespans[i].span > minutes_since_upload) {
				break;
			}
		}
	}

	chart_timespan = timespan
	chart_interval = interval

	console.log("updating graph", chart_timespan, chart_interval)

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

let download_info = false

onMount(() => {
	chart.data().datasets = [
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
})
</script>

<div class="indent">
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
		<tr>
			<td>
				Unique downloads
				<button class="button small_button round"
					class:button_highlight={download_info}
					style="margin: 0;"
					on:click={() => download_info = !download_info}
				>
					<i class="icon">help</i>
				</button>
			</td>
			<td>{formatThousands(file.downloads)}</td>
		</tr>
		{#if download_info}
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
		{/if}
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
		<tr>
			<td>SHA256 hash</td>
			<td style="word-break: break-all;">{file.hash_sha256}</td>
		</tr>
	</table>

	<h2>Views and downloads</h2>

	<div class="button_bar">
		{#each chart_timespans as ts}
			<button
				on:click={() => { update_chart(ts.span, ts.interval) }}
				class:button_highlight={chart_timespan == ts.span}>
				{ts.label}
			</button>
		{/each}
	</div>

	<Chart bind:this={chart} />

	<p style="text-align: center">
		Charts rendered by the amazing <a href="https://www.chartjs.org/" target="_blank" rel="noreferrer">Chart.js</a>.
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
