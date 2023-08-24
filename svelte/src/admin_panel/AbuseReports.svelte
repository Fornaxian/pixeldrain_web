<script>
import { onMount } from "svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import AbuseReport from "./AbuseReport.svelte";

let loading = true
let reports = []

let startPicker
let endPicker

let tab = "pending"

let refresh_timeout = null
const resolve_report = (remove = -1) => {
	if (remove >= 0) {
		console.debug("removing item", remove)
		reports.splice(remove, 1)
		reports = reports
	}

	// If a refresh is already scheduled we remove it and schedule a new one
	clearTimeout(refresh_timeout)
	refresh_timeout = setTimeout(get_reports, 5000)
}

const get_reports = async () => {
	loading = true;

	try {
		const resp = await fetch(
			window.api_endpoint+
				"/admin/abuse_report"+
				"?start="+(new Date(startPicker.value)).toISOString()+
				"&end="+(new Date(endPicker.value)).toISOString()+
				"&status="+tab
		);
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}

		reports = await resp.json();

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
		})
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
		<div>Reports: {reports.length}</div>
		<div class="toolbar_spacer"></div>
		<div>Start:</div>
		<input type="date" bind:this={startPicker}/>
		<div>End:</div>
		<input type="date" bind:this={endPicker}/>
		<button on:click={get_reports}>Go</button>
	</div>

	<div class="tab_bar">
		<button on:click={() => {tab = "pending"; get_reports()}} class:button_highlight={tab === "pending"}>
			<i class="icon">flag</i>
			Pending
		</button>
		<button on:click={() => {tab = "granted"; get_reports()}} class:button_highlight={tab === "granted"}>
			<i class="icon">flag</i>
			Granted
		</button>
		<button on:click={() => {tab = "rejected"; get_reports()}} class:button_highlight={tab === "rejected"}>
			<i class="icon">flag</i>
			Rejected
		</button>
	</div>

	{#each reports as report, i (report.id)}
		<AbuseReport report={report} on:refresh={() => resolve_report(i)}/>
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

.tab_bar {
	border-bottom: 2px solid var(--separator);
}
</style>
