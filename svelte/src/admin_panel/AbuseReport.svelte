<script lang="ts">
import { formatDate, formatNumber } from "util/Formatting";
import Expandable from "util/Expandable.svelte";
import type { UserReport } from "lib/AdminAPI";

let { report, ip_report_count, on_resolve_report, on_resolve_by_ip }: {
	report: UserReport;
	ip_report_count: {[key:string]: number};
	on_resolve_report: (action: string, report_type: string) => void;
	on_resolve_by_ip: (ip: string, action: string) => void;
} = $props();
let preview = $state(false)

let can_grant = $derived(report.status !== "granted")
let can_reject = $derived(report.status !== "rejected")

let set_status = async (action: string, report_type: string) => {
	on_resolve_report(action, report_type)
}
</script>

<Expandable expanded={report.status === "pending"} click_expand>
	{#snippet header()}
		<div class="header">
			<div class="icon_cell">
				<img class="file_icon" src={"/api/file/"+report.file.id+"/thumbnail"} alt="File thumbnail"/>
			</div>

			<div class="title">
				{report.file.name}
			</div>
			<div class="stats">
				Type<br/>
				{report.file.abuse_type === "" ? report.type : report.file.abuse_type}
			</div>
			{#if report.status !== "pending"}
				<div class="stats">
					Status<br/>
					{report.status}
				</div>
			{/if}
			<div class="stats">R<br/>{report.reports.length}</div>
			<div class="stats">V<br/>{formatNumber(report.file.views, 3)}</div>
			<div class="stats">DL<br/>{formatNumber(report.file.bandwidth_used / report.file.size, 3)}</div>
		</div>
	{/snippet}
	<div class="details">
		<div class="toolbar">
			<div class="action_list">
				<a class="button" target="_blank" href={"/u/"+report.file.id} rel="noreferrer">
					<i class="icon">open_in_new</i> Open file
				</a>
				<button class:button_highlight={preview} onclick={() => {preview = !preview}}>
					<i class="icon">visibility</i> Preview
				</button>
				{#if can_grant}
					<button class="button_highlight" onclick={() => {set_status("grant", report.type)}}>
						<i class="icon">done</i> Block ({report.type})
					</button>
				{/if}
				{#if can_reject}
					<button class="button_red" onclick={() => {set_status("reject", "")}}>
						<i class="icon">delete</i> Ignore
					</button>
				{/if}
			</div>
			<div class="type_list">
				<button onclick={() => {set_status("grant", "copyright")}}>copyright</button>
				<button onclick={() => {set_status("grant", "terrorism")}}>terrorism</button>
				<button onclick={() => {set_status("grant", "gore")}}>gore</button>
				<button onclick={() => {set_status("grant", "child_abuse")}}>child_abuse</button>
				<button onclick={() => {set_status("grant", "zoophilia")}}>zoophilia</button>
				<button onclick={() => {set_status("grant", "malware")}}>malware</button>
				<button onclick={() => {set_status("grant", "doxing")}}>doxing</button>
				<button onclick={() => {set_status("grant", "revenge_porn")}}>revenge_porn</button>
			</div>
		</div>
		<div style="text-align: center;">
			{#if preview}
			<br/>
			<iframe
				title="File preview"
				src="/u/{report.file.id}?embed"
				style="border: none; width: 100%; height: 600px; border-radius: 16px;"
			></iframe>
			{/if}
		</div>
		<div class="table_scroll">
			<table>
				<thead>
					<tr>
						<td>Time</td>
						<td>IP</td>
						<td>Type</td>
						<td>Status</td>
						<td colspan="2">Reports from this IP</td>
					</tr>
				</thead>
				<tbody>
					{#each report.reports as user_report}
						<tr>
							<td>{formatDate(user_report.time, true, true, false)}</td>
							<td>{user_report.ip_address}</td>
							<td>{user_report.type}</td>
							<td>{user_report.status}</td>
							<td>{ip_report_count[user_report.ip_address]}</td>
							<td>
								{#if can_grant}
									<button onclick={() => on_resolve_by_ip(user_report.ip_address, "grant")}>
										Accept all
									</button>
								{/if}
								{#if can_reject}
									<button onclick={() => on_resolve_by_ip(user_report.ip_address, "reject")}>
										Ignore all
									</button>
								{/if}
							</td>
						</tr>
						{#if user_report.description !== ""}
							<tr>
								<td>Description</td>
								<td colspan="5" style="white-space: pre-wrap; word-wrap: break-word;">
									{user_report.description}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</Expandable>

<style>
.header {
	display: flex;
	flex-direction: row;
	line-height: 1.2em;
}
.icon_cell {
	flex: 0 0 auto;
	line-height: 0;
	margin-right: 6px;
}
.title {
	flex: 1 1 auto;
	align-self: center;
	word-break: break-all;
}
.stats {
	flex: 0 0 auto;
	padding: 0 4px;
	border-left: 1px solid var(--separator);
	text-align: center;
}
.details {
	flex: 1 1 auto;
}
.toolbar {
	display: flex;
	flex-direction: row;
}
.file_icon {
	width:48px;
	height:48px;
}
.action_list {
	flex: 0 0 auto;
	display: grid;
	grid-template-columns: 1fr 1fr;
}
@media(max-width: 600px) {
	.action_list {
		grid-template-columns: 1fr;
	}
}

.type_list {
	flex: 1 1 auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	align-content: center;
}
.type_list > * {
	flex: 0 0 auto;
}
</style>
