<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Expandable from "../util/Expandable.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";

let loading = true
let rows = []

let expanded = false
let creating = false
let new_ban_address
let new_ban_reason = "unknown"

const get_bans = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/ip_ban");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		rows = await resp.json()
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
				<table class="form">
					<tr>
						<td>IP address</td>
						<td><input type="text" bind:this={new_ban_address}/></td>
					</tr>
					<tr>
						<td>Reason</td>
						<td>
							<input id="reason_unknown" name="reporter_type" type="radio" bind:group={new_ban_reason} value="unknown" />
							<label for="reason_unknown">unknown</label>
							<br/>
							<input id="reason_copyright" name="reporter_type" type="radio" bind:group={new_ban_reason} value="copyright" />
							<label for="reason_copyright">copyright</label>
							<br/>
							<input id="reason_child_abuse" name="reporter_type" type="radio" bind:group={new_ban_reason} value="child_abuse" />
							<label for="reason_child_abuse">child_abuse</label>
							<br/>
							<input id="reason_terrorism" name="reporter_type" type="radio" bind:group={new_ban_reason} value="terorrism" />
							<label for="reason_terrorism">terrorism</label>
							<br/>
							<input id="reason_gore" name="reporter_type" type="radio" bind:group={new_ban_reason} value="gore" />
							<label for="reason_gore">gore</label>
							<br/>
							<input id="reason_malware" name="reporter_type" type="radio" bind:group={new_ban_reason} value="malware" />
							<label for="reason_malware">malware</label>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<button class="button_highlight" type="submit" style="float: right;">
								<i class="icon">save</i> Save
							</button>
						</td>
					</tr>
				</table>
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
								{#if offence.file_public_id}
									<a href="/u/{offence.file_public_id}" target="_blank">
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
