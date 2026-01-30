<script lang="ts">
import { onMount } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import AbuseReport from "./AbuseReport.svelte";
import { get_abuse_reports, type UserReport } from "lib/AdminAPI";
import { get_endpoint } from "lib/PixeldrainAPI";

let loading = true
let reports: UserReport[] = []

let startPicker: HTMLInputElement
let endPicker: HTMLInputElement

let tab = "pending"

const get_reports = async () => {
	loading = true;

	// Remove refresh timeout if there is one
	clearTimeout(refresh_timeout)

	try {
		reports = await get_abuse_reports(new Date(startPicker.value), new Date(endPicker.value), tab)

		// Sort files by number of reports. If the number of reports is equal we
		// sort by number of views. If the number of views is equal we sort by
		// date of the first report received
		reports.sort((a, b) => {
			// Get the largest number of views or downloads
			const view_download_a = Math.max(a.file.views, Math.round(a.file.bandwidth_used / a.file.size))
			const view_download_b = Math.max(b.file.views, Math.round(b.file.bandwidth_used / b.file.size))

			if (a.reports.length !== b.reports.length) {
				// Sort descending
				return b.reports.length - a.reports.length
			} else if (view_download_a !== view_download_b) {
				// Sort descending
				return view_download_b-view_download_a
			} else if (a.first_report_time > b.first_report_time) {
				// Sort ascending
				return Date.parse(a.first_report_time) - Date.parse(b.first_report_time)
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

let ip_report_count: {[key: string]: number} = {}
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

const report_display_limit = 100

type Filter = {
	[key: string]: {
		checked: boolean
		count: number
	}
}
let type_filter: Filter = {}
let repords_hidden = 0
$: reports_filtered = filter_reports(reports, type_filter)

const filter_reports = (reports: UserReport[], filter: Filter): UserReport[] => {
	// Reset counter
	repords_hidden = 0
	for (let f in filter) {
		filter[f].count=0
	}

	const reports_filtered = reports.filter(report => {
		if (filter[report.type] === undefined) {
			filter[report.type] = {checked: true, count: 1}
		} else {
			filter[report.type].count++
		}

		if(filter[report.type].checked === true) {
			return true
		}

		repords_hidden++
		return false
	})

	// Make filter reactive
	type_filter = type_filter
	return reports_filtered
}

const resolve_report = async (report_id: string, action: string, report_type: string) => {
	const form = new FormData()
	form.append("action", action)
	if (action === "grant") {
		form.append("type", report_type)
	}

	try {
		const resp = await fetch(
			get_endpoint()+"/admin/abuse_report/"+report_id,
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text())
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
		<div>Range:</div>
		<input type="date" bind:this={startPicker}/>
		<input type="date" bind:this={endPicker}/>
		<button on:click={get_reports}>Go</button>
	</div>

	<div class="filters">
		<div class="filter">
			Type filters:<br/>
			{#each Object.keys(type_filter) as filter}
				<input type="checkbox" id="status_{filter}" bind:checked={type_filter[filter].checked}>
				<label for="status_{filter}">{filter} ({type_filter[filter].count})</label>
				<br/>
			{/each}
		</div>
	</div>

	Total: {reports.length}<br/>
	Visible: {Math.min(reports.length-repords_hidden, report_display_limit)}<br/>
	Hidden: {repords_hidden}<br/>

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

	{#each reports_filtered.slice(0, report_display_limit) as report (report.id)}
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

.tab_bar {
	border-bottom: 2px solid var(--separator);
}
</style>
