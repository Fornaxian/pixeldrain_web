<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Expandable from "../util/Expandable.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";

let loading = true
let rows = []
let total_offences = 0
let expanded = false

const get_bans = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/user_ban");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		rows = await resp.json()

		total_offences = rows.reduce(
			(acc, curr) => acc + curr.offences.length, 0,
		)
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

const delete_ban = async (userid) => {
	if (!confirm("Delete this banned user?\n\n"+userid)) {
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/user_ban/"+encodeURI(userid),
			{ method: "DELETE" }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to delete ban! "+err)
	}

	get_bans();
}

onMount(get_bans);
</script>

<LoadingIndicator loading={loading}/>

<section>
	<div class="toolbar">
		<div class="toolbar_label">
			Bans {rows.length}
		</div>
		<div class="toolbar_label">
			Offences {total_offences}
		</div>
		<div class="toolbar_spacer"></div>
		<button class:button_highlight={expanded} on:click={() => {expanded = !expanded}}>
			{#if expanded}
				<i class="icon">unfold_less</i> Collapse all
			{:else}
				<i class="icon">unfold_more</i> Expand all
			{/if}
		</button>
	</div>

	{#each rows as row (row.address)}
		<Expandable expanded={expanded} click_expand>
			<div slot="header" class="header">
				<div class="title">
					{row.username}<br/>
					{row.user_id}
				</div>
				<div class="stats">
					Offences<br/>
					{row.offences.length}
				</div>
				<div class="stats">
					Date<br/>
					{formatDate(row.offences[0].ban_time, false, false, false)}
				</div>
				<button on:click|stopPropagation={() => {delete_ban(row.user_id)}} class="button button_red" style="align-self: center;">
					<i class="icon">delete</i>
				</button>
			</div>
			<div class="table_scroll">
				<table>
					<tr>
						<td>Reason</td>
						<td>Reporter</td>
						<td>Ban time</td>
						<td>Expire time</td>
						<td>File</td>
					</tr>
					{#each row.offences as offence (offence.ban_time)}
						<tr>
							<td>{offence.reason}</td>
							<td>{offence.reporter}</td>
							<td>{formatDate(offence.ban_time, true, true, false)}</td>
							<td>{formatDate(offence.expire_time, true, true, false)}</td>
							<td>
								{#if offence.file_link}
									<a href={offence.file_link} target="_blank" rel="noreferrer">
										{offence.file_name}
									</a>
								{/if}
							</td>
						</tr>
					{/each}
				</table>
			</div>
		</Expandable>
	{/each}
</section>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	text-align: left;
	margin-top: 10px;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
.toolbar_label { margin: 5px; }


.header {
	display: flex;
	flex-direction: row;
	line-height: 1.2em;
}
.title {
	flex: 1 1 auto;
	align-self: center;
	word-break: break-all;
	padding-left: 8px;
}
.stats {
	flex: 0 0 auto;
	padding: 0 4px;
	border-left: 1px solid var(--separator);
	text-align: center;
}
</style>
