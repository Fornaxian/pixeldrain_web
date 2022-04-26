<script>
import { onMount } from "svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import AbuseReport from "./AbuseReport.svelte";

let loading = true
let reports_pending = []
let reports_processed = []

let startPicker
let endPicker

const get_reports = async () => {
	loading = true;

	try {
		const resp = await fetch(
			window.api_endpoint+
				"/admin/abuse_report"+
				"?start="+(new Date(startPicker.value)).toISOString()+
				"&end="+(new Date(endPicker.value)).toISOString()
		);
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		let reports = await resp.json();

		// Sort files by number of reports. If the number of reports is equal we
		// sort by number of views. If the number of views is equal we sort by
		// date of the first report received
		reports.sort((a, b) => {
			if (a.reports.length > b.reports.length) {
				return -1
			} else if (a.reports.length < b.reports.length) {
				return 1
			} else if (a.file.views > b.file.views) {
				return -1
			} else if (a.file.views < b.file.views) {
				return 1
			} else if (a.first_report_time > b.first_report_time) {
				return -1
			} else if (a.first_report_time < b.first_report_time) {
				return 1
			} else {
				return 0
			}
		})

		reports_pending = []
		reports_processed = []

		// Sort individual reports of each file from old to new, then separate
		// pending reports and processed reports
		reports.forEach(v => {
			v.reports.sort((a, b) => {
				if (a.time > b.time) {
					return 1
				} else if (a.time < b.time) {
					return -1
				} else {
					return 0
				}
			})

			if (v.status === "pending") {
				reports_pending.push(v)
			} else {
				reports_processed.push(v)
			}
		})

		// Update svelte views
		reports_processed = reports_processed
		reports_pending = reports_pending
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

onMount(() => {
	let start = new Date()
	start.setDate(start.getDate() - 28)
	let end = new Date()

	startPicker.valueAsNumber = start.getTime()
	endPicker.valueAsNumber = end.getTime()

	get_reports()
});
</script>

<LoadingIndicator loading={loading}/>

<section>
	<div class="toolbar" style="text-align: left;">
		<div class="toolbar_spacer"></div>
		<div>Start:</div>
		<input type="date" bind:this={startPicker}/>
		<div>End:</div>
		<input type="date" bind:this={endPicker}/>
		<button on:click={get_reports}>Go</button>
	</div>

	<h2>Pending</h2>
	{#each reports_pending as report (report.id)}
		{#if report.status === "pending"}
		<AbuseReport report={report} on:refresh={get_reports}/>
		{/if}
	{/each}

	<h2>Resolved</h2>
	{#each reports_processed as report (report.id)}
		{#if report.status !== "pending"}
		<AbuseReport report={report} on:refresh={get_reports}/>
		{/if}
	{/each}
</section>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	align-items: center;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }

</style>
