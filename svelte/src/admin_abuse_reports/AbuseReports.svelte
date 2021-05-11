<script>
import { onMount } from "svelte";
import Spinner from "../util/Spinner.svelte";
import AbuseReport from "./AbuseReport.svelte";

let loading = true
let reports = []

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
		reports = await resp.json();

		// Sort files from new to old
		reports.sort((a, b) => {
			if (a.first_report_time > b.first_report_time) {
				return -1
			} else if (a.first_report_time < b.first_report_time) {
				return 1
			} else {
				return 0
			}
		})

		// Sort individual reports from old to new
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
	start.setMonth(start.getMonth() - 1)
	let end = new Date()

	startPicker.valueAsNumber = start.getTime()
	endPicker.valueAsNumber = end.getTime()

	get_reports()
});
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}

	<div class="limit_width">
		<div class="toolbar" style="text-align: left;">
			<a class="button" href="/admin">
				<i class="icon">arrow_back</i> Return to admin panel
			</a>
			<div class="toolbar_spacer"></div>
			<div>
				Start: <input type="date" bind:this={startPicker}/>
				End: <input type="date" bind:this={endPicker}/>
			</div>
			<button on:click={get_reports}><i class="icon">refresh</i></button>
		</div>

		<h2>Pending</h2>
		{#each reports as report}
			{#if report.status === "pending"}
			<AbuseReport report={report} on:refresh={get_reports}/>
			{/if}
		{/each}

		<h2>Resolved</h2>
		{#each reports as report}
			{#if report.status !== "pending"}
			<AbuseReport report={report} on:refresh={get_reports}/>
			{/if}
		{/each}
	</div>
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
}
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }

</style>
