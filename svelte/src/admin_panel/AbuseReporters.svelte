<script>
import { onMount, tick } from "svelte";
import { formatDate, formatDuration } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = true
let reporters = []

const get_reporters = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/abuse_reporter");
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
		reporters = await resp.json();
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

let edit_button
let creating = false
let new_reporter_from_address
let new_reporter_mail_server
let new_reporter_name
let new_reporter_status = "trusted"

const create_reporter = async () => {
	if (!new_reporter_from_address.value) {
		alert("Please enter an e-mail address")
		return
	} else if (!new_reporter_mail_server.value) {
		alert("Please enter a mail server")
		return
	} else if (!new_reporter_name.value) {
		alert("Please enter a name")
		return
	} else if (!new_reporter_status) {
		alert("Please enter a status")
		return
	}

	try {
		const form = new FormData()
		form.append("from_address", new_reporter_from_address.value)
		form.append("mail_server", new_reporter_mail_server.value)
		form.append("name", new_reporter_name.value)
		form.append("status", new_reporter_status)

		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_reporter",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to add abuse reporter! "+err)
	}

	creating = false
	get_reporters();
}

const edit_reporter = async reporter => {
	edit_button.scrollIntoView()
	creating = true
	await tick()
	new_reporter_from_address.value = reporter.from_address
	new_reporter_mail_server.value = reporter.mail_server
	new_reporter_name.value = reporter.name
	new_reporter_status = reporter.status
}

const delete_reporter = async (address, server) => {
	if (!confirm("Delete this reporter address?\n\n"+address)) {
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_reporter/"+encodeURI(address)+"/"+encodeURI(server),
			{ method: "DELETE" }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to delete abuse reporter! "+err)
	}

	get_reporters();
}

onMount(get_reporters);
</script>

{#if loading}
	<div class="spinner_container">
		<Spinner />
	</div>
{/if}

<section>
	<div class="toolbar" style="text-align: left;">
		<div class="toolbar_spacer"></div>
		<button bind:this={edit_button} class:button_highlight={creating} on:click={() => {creating = !creating}}>
			<i class="icon">create</i> Add abuse reporter
		</button>
	</div>
	{#if creating}
		<div class="highlight_light">
			<form on:submit|preventDefault={create_reporter}>
				<table class="form">
					<tr>
						<td>E-mail address</td>
						<td><input type="text" bind:this={new_reporter_from_address}/></td>
					</tr>
					<tr>
						<td>Mail server</td>
						<td><input type="text" bind:this={new_reporter_mail_server}/></td>
					</tr>
					<tr>
						<td>Name</td>
						<td><input type="text" bind:this={new_reporter_name} value="Anonymous tip"/></td>
					</tr>
					<tr>
						<td>Status</td>
						<td>
							<input id="reporter_status_1" name="reporter_status" type="radio" bind:group={new_reporter_status} value="trusted" />
							<label for="reporter_status_1">Trusted</label>
							<br/>
							<input id="reporter_status_2" name="reporter_status" type="radio" bind:group={new_reporter_status} value="rejected" />
							<label for="reporter_status_2">Rejected</label>
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
</section>

<br/>

<div class="table_scroll">
	<table style="text-align: left;">
		<tr>
			<td>Address</td>
			<td>Server</td>
			<td>Name</td>
			<td>Status</td>
			<td>Reports</td>
			<td>Blocked</td>
			<td>Last used</td>
			<td>Created</td>
			<td></td>
		</tr>
		{#each reporters as r (r.email)}
			<tr>
				<td>{r.from_address}</td>
				<td>{r.mail_server}</td>
				<td>{r.name}</td>
				<td>{r.status}</td>
				<td>{r.reports_sent}</td>
				<td>{r.files_blocked}</td>
				<td>{formatDate(r.last_used, true, true, false)}</td>
				<td>{formatDate(r.created, false, false, false)}</td>
				<td>
					<button on:click|preventDefault={() => {edit_reporter(r)}} class="button round">
						<i class="icon">edit</i>
					</button>
					<button on:click|preventDefault={() => {delete_reporter(r.from_address, r.mail_server)}} class="button button_red round">
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
