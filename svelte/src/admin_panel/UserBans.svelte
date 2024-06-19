<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";
import Expandable from "../util/Expandable.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import Button from "../layout/Button.svelte"
import Euro from "../util/Euro.svelte"

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

const impersonate = async user_id => {
	const form = new FormData()
	form.append("id", user_id)

	const resp = await fetch(
		window.api_endpoint+"/admin/impersonate",
		{ method: "POST", body: form }
	);
	if(resp.status >= 400) {
		alert(await resp.text())
		return
	}

	window.open("/user", "_blank")
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

	{#each rows as row (row.user_id)}
		<Expandable expanded={expanded} click_expand>
			<div slot="header" class="header">
				<div class="title">
					{row.user.username}
				</div>
				<div class="stats">
					Type<br/>
					{row.offences[0].reason}
				</div>
				<div class="stats">
					Count<br/>
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

			<Button click={() => impersonate(row.user_id)} icon="login" label="Impersonate user"/>
			<table>
				<tr>
					<td>Username</td>
					<td>{row.user.username}</td>
				</tr>
				<tr>
					<td>ID</td>
					<td>{row.user_id}</td>
				</tr>
				<tr>
					<td>Email</td>
					<td>{row.user.email}</td>
				</tr>
				<tr>
					<td>Subscription</td>
					<td>{row.user.subscription.name}</td>
				</tr>
				<tr>
					<td>Credit balance</td>
					<td><Euro amount={row.user.balance_micro_eur}/></td>
				</tr>
				<tr>
					<td>Storage used</td>
					<td>{formatDataVolume(row.user.storage_space_used, 3)}</td>
				</tr>
				<tr>
					<td>FS Storage used</td>
					<td>{formatDataVolume(row.user.filesystem_storage_used, 3)}</td>
				</tr>
			</table>
			<br/>
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
