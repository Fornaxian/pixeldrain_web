<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Expandable from "../util/Expandable.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";

const abuse_types = [
	"copyright",
	"child_abuse",
	"terrorism",
	"gore",
	"zoophilia",
	"malware",
	"doxing",
	"revenge_porn",
]

let loading = true
let rows = []
let total_offences = 0

let expanded = false
let creating = false
let new_ban_address
let new_ban_reason = abuse_types[0]

const get_bans = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/ip_ban");
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

const create_ban = async () => {
	if (!new_ban_address.value) {
		alert("Please enter an IP address!")
		return
	} else if (!new_ban_reason) {
		alert("Please enter a reason!")
		return
	}

	try {
		const form = new FormData()
		form.append("address", new_ban_address.value)
		form.append("reason", new_ban_reason)

		const resp = await fetch(
			window.api_endpoint+"/admin/ip_ban",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to add IP ban! "+err)
	}

	creating = false
	get_bans();
}

const delete_ban = async (addr) => {
	if (!confirm("Delete this banned address?\n\n"+addr)) {
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/ip_ban/"+encodeURI(addr),
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
		<button class:button_highlight={creating} on:click={() => {creating = !creating}}>
			<i class="icon">create</i> Add IP ban
		</button>
	</div>
	{#if creating}
		<div class="highlight_shaded">
			<form on:submit|preventDefault={create_ban}>
				<div class="form">
					<label for="field_address">IP address</label>
					<input id="field_address" type="text" bind:this={new_ban_address}/>
					<label for="field_reason">Reason</label>
					<div id="field_reason">
						{#each abuse_types as t (t)}
							<input id="reason_{t}" name="reporter_type" type="radio" bind:group={new_ban_reason} value="{t}" />
							<label for="reason_{t}">{t}</label>
							<br/>
						{/each}
					</div>
					<button class="button_highlight" type="submit" style="float: right;">
						<i class="icon">save</i> Save
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#each rows as row (row.address)}
		<Expandable expanded={expanded} click_expand>
			<div slot="header" class="header">
				<div class="title">{row.address}</div>
				<div class="stats">
					Offences<br/>
					{row.offences.length}
				</div>
				<div class="stats">
					Date<br/>
					{formatDate(row.offences[0].ban_time, false, false, false)}
				</div>
				<button on:click|stopPropagation={() => {delete_ban(row.address)}} class="button button_red" style="align-self: center;">
					<i class="icon">delete</i>
				</button>
			</div>
			<div class="table_scroll">
				<table>
					<thead>
						<tr>
							<td>Reason</td>
							<td>Reporter</td>
							<td>Ban time</td>
							<td>Expire time</td>
							<td>File</td>
						</tr>
					</thead>
					<tbody>
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
					</tbody>
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
