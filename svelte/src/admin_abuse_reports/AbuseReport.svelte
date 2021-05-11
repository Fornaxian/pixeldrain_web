<script>
import { formatDate } from "../util/Formatting.svelte";
import Expandable from "../util/Expandable.svelte";
import { createEventDispatcher } from "svelte";
let dispatch = createEventDispatcher()

export let report
let expandable

let grant = () => {
	set_status("grant")
}
let reject = () => {
	set_status("reject")
}
let set_status = async (action) => {
	const form = new FormData()
	form.append("action", action)
	if (action === "grant") {
		form.append("type", report.type)
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_report/"+report.id,
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			throw new Error(resp.text())
		}

		dispatch("refresh");
	} catch (err) {
		alert(err);
	}
}

</script>

<Expandable bind:this={expandable} expanded={report.status === "pending"}>
	<div slot="header" class="header" on:click={expandable.toggle}>
		<div class="icon_cell">
			<img class="file_icon" src={"/api/file/"+report.file.id+"/thumbnail"} alt="File thumbnail"/>
		</div>

		<div class="title">{report.file.name}</div>
		<div class="stats">Type<br/>{report.type}</div>
		{#if report.status !== "pending"}
			<div class="stats">Status<br/>{report.status}</div>
		{/if}
		<div class="stats">R<br/>{report.reports.length}</div>
		<div class="stats">V<br/>{report.file.views}</div>
		<div class="stats">DL<br/>{Math.round(report.file.bandwidth_used / report.file.size)}</div>
	</div>
	<div class="details">
		<div style="text-align: center;">
			<a class="button" target="_blank" href={"/u/"+report.file.id}>
				<i class="icon">open_in_new</i> Open file
			</a>
			<button on:click={grant}><i class="icon">done</i> Grant (block file)</button>
			<button on:click={reject}><i class="icon">delete</i> Ignore reports</button>
		</div>
		<table>
			<tr>
				<td>Time</td>
				<td>IP</td>
				<td>Type</td>
				<td>Status</td>
			</tr>
			{#each report.reports as user_report}
				<tr>
					<td>{formatDate(user_report.time, true, true, true, true)}</td>
					<td>{user_report.ip_address}</td>
					<td>{user_report.type}</td>
					<td>{user_report.status}</td>
				</tr>
			{/each}
		</table>
	</div>
</Expandable>

<style>
.header {
	display: flex;
	flex-direction: row;
}
.icon_cell {
	flex: 0 0 auto;
	line-height: 0;
	margin-right: 6px;
}
.title {
	flex: 1 1 auto;
	align-self: center;
}
.stats {
	flex: 0 0 auto;
	padding: 3px 4px;
	line-height: 1.2em;
	border-left: 1px solid var(--layer_3_color_border);
	text-align: center;
}
.details {
	flex: 1 1 auto;
}
.file_icon {
	width:48px;
	height:48px;
}
</style>
