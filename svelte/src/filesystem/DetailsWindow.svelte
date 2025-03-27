<script>
import Chart from "util/Chart.svelte";
import { formatDataVolume, formatDate, formatNumber, formatThousands } from "util/Formatting.svelte";
import Modal from "util/Modal.svelte";
import { fs_path_url, fs_timeseries } from "./FilesystemAPI.mjs";
import { generate_share_path, generate_share_url } from "./Sharebar.svelte";
import { color_by_name } from "util/Util.svelte";
import { tick } from "svelte";
import CopyButton from "layout/CopyButton.svelte";

export let nav
export let visible = false
export const toggle = () => visible = !visible

$: visibility_change(visible)
const visibility_change = visible => {
	if (visible) {
		update_chart(nav.base, 0, 0)
	}
}

$: direct_url = $nav.base.path ? window.location.origin+fs_path_url($nav.base.path) : ""
$: share_url = generate_share_url($nav.path)
$: direct_share_url = $nav.base.path ? window.location.origin+fs_path_url(generate_share_path($nav.path)) : ""

let chart
let chart_timespan = 0
let chart_interval = 0
let chart_timespans = [
	{label: "Day (1m)", span: 1440, interval: 1},
	{label: "Week (1h)", span: 10080, interval: 60},
	{label: "Month (1d)", span: 43200, interval: 1440},
	{label: "Quarter (1d)", span: 131400, interval: 1440},
	{label: "Year (1d)", span: 525600, interval: 1440},
	{label: "Two Years (1d)", span: 1051200, interval: 1440},
	{label: "Five Years (1d)", span: 2628000, interval: 1440},
]

let total_downloads = 0
let total_transfer = 0

$: update_chart($nav.base, chart_timespan, chart_interval)
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

	console.log("Updating graph timespan", chart_timespan, "interval", chart_interval)

	let start = new Date()
	start.setMinutes(start.getMinutes() - timespan)
	let end = new Date()

	try {
		let resp = await fs_timeseries(base.path, start, end, interval)

		let c = chart.chart()

		c.options.scales.y1 = {
			type: "linear",
			display: true,
			position: "right",
			ticks: {
				callback: function (value, index, values) {
					return formatDataVolume(value, 3);
				},
			},
			beginAtZero: true,
			grid: {
				drawOnChartArea: false,
			},
		}


		resp.downloads.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let str = ("00" + (date.getMonth() + 1)).slice(-2);
			str += "-" + ("00" + date.getDate()).slice(-2);
			str += " " + ("00" + date.getHours()).slice(-2);
			str += ":" + ("00" + date.getMinutes()).slice(-2);
			resp.downloads.timestamps[idx] = "  " + str + "  "; // Poor man's padding
		});

		total_downloads = 0
		total_transfer = 0
		resp.downloads.amounts.forEach(val => total_downloads += val);
		resp.transfer_free.amounts.forEach((val) => total_transfer += val);
		resp.transfer_paid.amounts.forEach((val) => total_transfer += val);

		c.data.labels = resp.downloads.timestamps
		c.data.datasets = [
			{
				label: "Downloads",
				borderWidth: 2,
				pointRadius: 0,
				borderColor: color_by_name("chart_1_color"),
				backgroundColor: color_by_name("chart_1_color"),
				data: resp.downloads.amounts,
			}, {
				label: "Free transfer",
				borderWidth: 2,
				pointRadius: 0,
				borderColor: color_by_name("chart_2_color"),
				backgroundColor: color_by_name("chart_2_color"),
				yAxisID: "y1",
				data: resp.transfer_free.amounts,
			}, {
				label: "Premium transfer",
				borderWidth: 2,
				pointRadius: 0,
				borderColor: color_by_name("chart_3_color"),
				backgroundColor: color_by_name("chart_3_color"),
				yAxisID: "y1",
				data: resp.transfer_paid.amounts,
			},
		];
		chart.update()
	} catch (err) {
		console.error("Failed to get time series data:", err)
	}
}
</script>

<Modal bind:visible={visible} title="Details" width={($nav.base.type === "file" ? 1000 : 750) + "px"}>
	<table>
		<tbody>
			<tr>
				<td>Name</td>
				<td>{$nav.base.name}</td>
			</tr>
			<tr>
				<td>Path</td>
				<td>{$nav.base.path}</td>
			</tr>
			<tr>
				<td>Created by user</td>
				<td>{$nav.base.created_by}</td>
			</tr>
			<tr>
				<td>Creation date</td>
				<td>{formatDate($nav.base.created, true, true, true)}</td>
			</tr>
			<tr>
				<td>Modification date</td>
				<td>{formatDate($nav.base.modified, true, true, true)}</td>
			</tr>
			<tr>
				<td>Mode</td>
				<td>{$nav.base.mode_string}</td>
			</tr>
			{#if $nav.base.id}
				<tr>
					<td>Public ID</td>
					<td><a href="/d/{$nav.base.id}">{$nav.base.id}</a></td>
				</tr>
			{/if}
			{#if $nav.base.type === "file"}
				<tr>
					<td>File type</td>
					<td>{$nav.base.file_type}</td>
				</tr>
				<tr>
					<td>File size</td>
					<td>{formatDataVolume($nav.base.file_size, 4)} ( {formatThousands($nav.base.file_size)} B )</td>
				</tr>
				<tr>
					<td>Downloads</td>
					<td>{formatThousands(total_downloads)} (unique, counted once per IP)</td>
				</tr>
				<tr>
					<td>Transfer used</td>
					<td>
						{formatDataVolume(total_transfer, 4)}
						( {formatThousands(total_transfer)} B ),
						{(total_transfer/$nav.base.file_size).toFixed(1)}x file size
					</td>
				</tr>
				<tr><td>SHA256 sum</td><td>{$nav.base.sha256_sum}</td></tr>
			{/if}
			<tr>
				<td>Direct link</td>
				<td>
					<CopyButton text={direct_url}>Copy</CopyButton>
					<a href="{direct_url}">{direct_url}</a>
				</td>
			</tr>
			{#if share_url !== ""}
				<tr>
					<td>Sharing link</td>
					<td>
						<CopyButton text={share_url}>Copy</CopyButton>
						<a href="{share_url}">{share_url}</a>
					</td>
				</tr>
				<tr>
					<td>Direct sharing link</td>
					<td>
						<CopyButton text={direct_share_url}>Copy</CopyButton>
						<a href="{direct_share_url}">{direct_share_url}</a>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>

	{#if $nav.base.type === "file"}
		<h3 class="indent">Download statistics</h3>

		<div class="button_bar">
			{#each chart_timespans as ts}
				<button
					on:click={() => update_chart($nav.base, ts.span, ts.interval)}
					class:button_highlight={chart_timespan == ts.span}>
					{ts.label}
				</button>
			{/each}
		</div>

		<Chart bind:this={chart} />
	{/if}
</Modal>

<style>
table {
	/* yes this sucks, sue me */
	width: 98%;
	margin: auto;
}
td:first-child {
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
