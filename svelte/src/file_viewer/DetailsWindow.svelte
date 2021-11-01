<script>
import Chart from "../util/Chart.svelte";
import { formatDataVolume, formatDate, formatThousands } from "../util/Formatting.svelte"
import { domain_url } from "../util/Util.svelte";

export let file = {
	id: "",
	name: "",
	mime_type: "",
	date_created: "",
	size: 0,
	downloads: 0,
	bandwidth_used: 0,
	description: "",
	timeseries_href: "",
}

let download_chart
let view_chart

$: update_charts(file.id)
let update_charts = () => {
	console.log("updating graph")

	let today = new Date()
	let start = new Date()
	start.setDate(start.getDate() - 90)

	fetch(
		file.timeseries_href +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&interval=" + 60
	).then(resp => {
		if (!resp.ok) { return null }
		return resp.json()
	}).then(resp => {
		resp.views.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = ("00" + (date.getMonth() + 1)).slice(-2);
			dateStr += "-" + ("00" + date.getDate()).slice(-2);
			dateStr += " " + ("00" + date.getHours()).slice(-2) + "h";
			resp.views.timestamps[idx] = "   " + dateStr + "   "; // Poor man's padding
		});
		resp.bandwidth.amounts.forEach((val, idx) => {
			resp.bandwidth.amounts[idx] = Math.round(val / file.size);
		});
		download_chart.chart().data.labels = resp.views.timestamps
		view_chart.chart().data.labels = resp.views.timestamps
		download_chart.chart().data.datasets[0].data = resp.bandwidth.amounts
		view_chart.chart().data.datasets[0].data = resp.views.amounts
		download_chart.update()
		view_chart.update()
	})
}
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
			<td>Bandwidth</td>
			<td>{formatDataVolume(file.bandwidth_used, 4)} ( {formatThousands(file.bandwidth_used)} B )</td>
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

	<h2>Downloads</h2>
	<Chart bind:this={download_chart}></Chart>
	<h2>Views</h2>
	<Chart bind:this={view_chart}></Chart>

	<p style="text-align: center">
		Charts rendered by the amazing <a href="https://www.chartjs.org/" target="_blank">Chart.js</a>.
	</p>

	<h3>About</h3>
	Pixeldrain is a file sharing platform.
	<a href="/" target="_blank">Visit the home page for more information.</a>

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
