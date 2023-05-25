<script>
import Chart from "../util/Chart.svelte";
import { formatDataVolume, formatDate, formatThousands } from "../util/Formatting.svelte";
import Modal from "../util/Modal.svelte";
import { fs_timeseries } from "./FilesystemAPI";
import { fs_path_url } from "./FilesystemUtil";
import { generate_share_url } from "./Sharebar.svelte";
import { color_by_name } from "../util/Util.svelte";
import { tick } from "svelte";

export let state
export let visible = false
export const toggle = () => visible = !visible

$: visibility_change(visible)
const visibility_change = visible => {
	if (visible) {
		update_chart(state.base, 0, 0)
	}
}

$: direct_url = window.location.origin+fs_path_url(state.root.id, state.base.path)
$: share_url = generate_share_url(state.path)

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

let total_downloads = 0
let total_bandwidth_free = 0
let total_bandwidth_paid = 0

$: update_chart(state.base, chart_timespan, chart_interval)
let update_chart = async (base, timespan, interval) => {
	if (chart === undefined) {
		// Wait for the chart element to render, if it's not rendered already
		await tick()
	}

	if (!visible || base.type !== "file" || chart === undefined) {
		return
	}

	// If the timespan is 0 we calculate the maximum timespan based on the age
	// of the file
	if (timespan === 0) {
		let minutes_since_upload = (new Date().getTime() - Date.parse(base.created)) / 1000 / 60

		console.log("minutes", minutes_since_upload)

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

	console.log("Updating graph", chart_timespan, chart_interval)

	let start = new Date()
	start.setMinutes(start.getMinutes() - timespan)
	let end = new Date()

	try {
		let resp = await fs_timeseries(state.root.id, base.path, start, end, interval)

		chart.data().datasets = [
			{
				label: "Unique downloads",
				borderWidth: 2,
				pointRadius: 0,
				borderColor: color_by_name("chart_1_color"),
				backgroundColor: color_by_name("chart_1_color"),
			}, {
				label: "Free downloads",
				borderWidth: 2,
				pointRadius: 0,
				borderColor: color_by_name("chart_2_color"),
				backgroundColor: color_by_name("chart_2_color"),
			}, {
				label: "Paid downloads",
				borderWidth: 2,
				pointRadius: 0,
				borderColor: color_by_name("chart_3_color"),
				backgroundColor: color_by_name("chart_3_color"),
			},
		];

		resp.downloads.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let str = ("00" + (date.getMonth() + 1)).slice(-2);
			str += "-" + ("00" + date.getDate()).slice(-2);
			str += " " + ("00" + date.getHours()).slice(-2);
			str += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.downloads.timestamps[idx] = "  " + str + "  "; // Poor man's padding
		});

		total_downloads = 0
		total_bandwidth_free = 0
		total_bandwidth_paid = 0

		resp.downloads.amounts.forEach(val => total_downloads += val);
		resp.bandwidth_free.amounts.forEach((val, idx) => {
			resp.bandwidth_free.amounts[idx] = val / base.file_size;
			total_bandwidth_free += val
		});
		resp.bandwidth_paid.amounts.forEach((val, idx) => {
			resp.bandwidth_paid.amounts[idx] = val / base.file_size;
			total_bandwidth_paid += val
		});
		chart.data().labels = resp.downloads.timestamps
		chart.data().datasets[0].data = resp.downloads.amounts
		chart.data().datasets[1].data = resp.bandwidth_free.amounts
		chart.data().datasets[2].data = resp.bandwidth_paid.amounts
		chart.update()
	} catch (err) {
		console.error("Failed to get time series data:", err)
	}
}
</script>

<Modal bind:visible={visible} title="Details" width="1000px">
	<h3 class="indent">Node details</h3>
	<table style="width: 100%;">
		<tr><td>Name</td><td>{state.base.name}</td></tr>
		<tr><td>Path</td><td>{state.base.path}</td></tr>
		<tr><td>Date created</td><td>{formatDate(state.base.created, true, true, true)}</td></tr>
		<tr><td>Date modified</td><td>{formatDate(state.base.modified, true, true, true)}</td></tr>
		<tr><td>Mode</td><td>{state.base.mode_string}</td></tr>
		{#if state.base.id}
			<tr>
				<td>Public ID</td>
				<td><a href="/d/{state.base.id}">{state.base.id}</a></td>
			</tr>
		{/if}
		{#if state.base.type === "file"}
			<tr><td>File type</td><td>{state.base.file_type}</td></tr>
			<tr><td>File size</td><td>{formatDataVolume(state.base.file_size)}</td></tr>
			<tr><td>Unique downloads</td><td>{formatThousands(total_downloads)}</td></tr>
			<tr>
				<td>Free bandwidth used</td>
				<td>
					{formatDataVolume(total_bandwidth_free, 4)}
					( {formatThousands(total_bandwidth_free)} B ),
					{(total_bandwidth_free/state.base.file_size).toFixed(1)}x file size
				</td>
			</tr>
			<tr>
				<td>Premium bandwidth used</td>
				<td>
					{formatDataVolume(total_bandwidth_paid, 4)}
					( {formatThousands(total_bandwidth_paid)} B ),
					{(total_bandwidth_paid/state.base.file_size).toFixed(1)}x file size
				</td>
			</tr>
			<tr><td>SHA256 sum</td><td>{state.base.sha256_sum}</td></tr>
		{/if}
		<tr><td>Direct URL</td><td><a href="{direct_url}">{direct_url}</a></td></tr>
		{#if share_url !== ""}
			<tr><td>Share URL</td><td><a href="{share_url}">{share_url}</a></td></tr>
		{/if}
	</table>

	{#if state.base.type === "file"}
		<h3 class="indent">Download statistics</h3>

		<div class="button_bar">
			{#each chart_timespans as ts}
				<button
					on:click={() => { update_chart(state.base, ts.span, ts.interval) }}
					class:button_highlight={chart_timespan == ts.span}>
					{ts.label}
				</button>
			{/each}
		</div>

		<Chart bind:this={chart} />
	{/if}
</Modal>

<style>
td:first-child {
	white-space: nowrap;
	word-break: keep-all;
}
td {
	word-break: break-word;
}

.button_bar {
	display: block;
	width: 100%;
	text-align: center;
}
</style>
