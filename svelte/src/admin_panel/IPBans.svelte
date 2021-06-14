<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = true
let rows = []

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
		rows.sort((a, b) => {
			return b.ban_time.localeCompare(a.ban_time)
		});
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

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}

	<div class="limit_width">
		<div class="toolbar" style="text-align: left;">
			<div class="toolbar_spacer"></div>
			<button class:button_highlight={creating} on:click={() => {creating = !creating}}>
				<i class="icon">create</i> Add IP ban
			</button>
		</div>
		{#if creating}
			<div class="highlight_light">
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
	</div>

	<br/>

	<table style="text-align: left;">
		<tr>
			<td>Address</td>
			<td>Reason</td>
			<td>Ban time</td>
			<td>Expire time</td>
			<td>Offences</td>
			<td></td>
		</tr>
		{#each rows as row}
			<tr>
				<td>{row.address}</td>
				<td>{row.reason}</td>
				<td>{formatDate(row.ban_time, true, true, false)}</td>
				<td>{formatDate(row.expire_time, true, true, false)}</td>
				<td>{row.offences}</td>
				<td>
					<button on:click|preventDefault={() => {delete_ban(row.address)}} class="button button_red">
						<i class="icon">delete</i>
					</button>
				</td>
			</tr>
		{/each}
	</table>
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
</style>
