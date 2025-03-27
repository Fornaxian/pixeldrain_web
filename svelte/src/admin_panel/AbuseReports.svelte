<script>
import { onMount } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import AbuseReport from "./AbuseReport.svelte";

let loading = true
let reports = []

let startPicker
let endPicker

let tab = "pending"

const get_reports = async () => {
	loading = true;

	// Remove refresh timeout if there is one
	clearTimeout(refresh_timeout)

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

		count_ip_reports()
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

let ip_report_count = {}
const count_ip_reports = () => {
	ip_report_count = {}
	reports.forEach(v => {
		// Count the number of pending reports per IP address
		v.reports.forEach(v => {
			if (ip_report_count[v.ip_address] === undefined) {
				ip_report_count[v.ip_address] = 0
			}
			ip_report_count[v.ip_address]++
		})
	})
}

const resolve_report = async (report_id, action, report_type) => {
	const form = new FormData()
	form.append("action", action)
	if (action === "grant") {
		form.append("type", report_type)
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_report/"+report_id,
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			throw new Error(resp.text())
		}

		remove_report(report_id)
	} catch (err) {
		alert(err);
	}
}

const resolve_by_ip = (ip = "", action = "grant") => {
	// Find which files were reported by this IP address
	reports.forEach(report => {
		report.reports.forEach(v => {
			if (v.ip_address === ip) {
				// We found a file which was reported by the same IP address
				resolve_report(report.id, action, v.type)
			}
		})
	})
}

let refresh_timeout = null
const remove_report = (id = "") => {
	// Find the report with our ID and remove it from the array
	for (let i = 0; i < reports.length; i++) {
		if (reports[i].id === id) {
			console.debug("removing item", id)
			reports.splice(i, 1)
			reports = reports

			// Update the report counts per IP address
			count_ip_reports()
			break
		}
	}

	// If a refresh is already scheduled we remove it and schedule a new one
	clearTimeout(refresh_timeout)
	refresh_timeout = setTimeout(get_reports, 60000)
}

onMount(() => {
	let start = new Date()
	start.setDate(start.getDate() - 28)
	let end = new Date()

	startPicker.valueAsNumber = start.getTime()
	endPicker.valueAsNumber = end.getTime()

	get_reports()

	return () => clearTimeout(refresh_timeout)
});
</script>

<LoadingIndicator loading={loading}/>

<section>
	<div class="toolbar" style="text-align: left;">
		<div>Reports: {reports.length}</div>
		<div class="toolbar_spacer"></div>
		<div>Range:</div>
		<input type="date" bind:this={startPicker}/>
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

	{#each reports.slice(0, 100) as report (report.id)}
		<AbuseReport
			report={report}
			ip_report_count={ip_report_count}
			on:resolve_report={e => resolve_report(report.id, e.detail.action, e.detail.report_type)}
			on:resolve_by_ip={e => resolve_by_ip(e.detail.ip, e.detail.action)}
		/>
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
