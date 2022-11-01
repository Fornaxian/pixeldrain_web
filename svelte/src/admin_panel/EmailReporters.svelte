<script>
import { onMount, tick } from "svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import AbuseReporterTable from "./AbuseReporterTable.svelte";

let loading = true
let reporters_pending = []
let reporters_trusted = []
let reporters_rejected = []

const get_reporters = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/abuse_reporter");
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
		let reporters = await resp.json();

		reporters_pending = reporters.reduce((acc, val) => {
			if (val.status === "pending") {
				acc.push(val)
			}
			return acc
		}, [])
		reporters_trusted = reporters.reduce((acc, val) => {
			if (val.status === "trusted") {
				acc.push(val)
			}
			return acc
		}, [])
		reporters_rejected = reporters.reduce((acc, val) => {
			if (val.status === "rejected") {
				acc.push(val)
			}
			return acc
		}, [])
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

const approve_reporter = async reporter => {
	try {
		const form = new FormData()
		form.append("from_address", reporter.from_address)
		form.append("mail_server", reporter.mail_server)
		form.append("name", reporter.name)
		form.append("status", "trusted")

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
	get_reporters();
}
const spam_reporter = async reporter => {
	try {
		const form = new FormData()
		form.append("from_address", reporter.from_address)
		form.append("mail_server", reporter.mail_server)
		form.append("name", reporter.name)
		form.append("status", "rejected")

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

const delete_reporter = async reporter => {
	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_reporter/"+
				encodeURI(reporter.from_address)+"/"+
				encodeURI(reporter.mail_server),
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

<LoadingIndicator loading={loading}/>

<section>
	<div class="toolbar" style="text-align: left;">
		<div class="toolbar_spacer"></div>
		<button bind:this={edit_button} class:button_highlight={creating} on:click={() => {creating = !creating}}>
			<i class="icon">create</i> Add abuse reporter
		</button>
	</div>
	{#if creating}
		<div class="highlight_shaded">
			<form on:submit|preventDefault={create_reporter}>
				<div class="form">
					<label for="field_from_address">E-mail address</label>
					<input id="field_from_address" type="text" bind:this={new_reporter_from_address}/>
					<label for="field_mailserver">Mail server</label>
					<input id="field_mailserver" type="text" bind:this={new_reporter_mail_server}/>
					<label for="field_name">Name</label>
					<input id="field_name" type="text" bind:this={new_reporter_name} value="Anonymous tip"/>
					<label for="reporter_status">Status</label>
					<div>
						<input id="reporter_status_1" name="reporter_status" type="radio" bind:group={new_reporter_status} value="trusted" />
						<label for="reporter_status_1">Trusted</label>
						<br/>
						<input id="reporter_status_2" name="reporter_status" type="radio" bind:group={new_reporter_status} value="rejected" />
						<label for="reporter_status_2">Rejected</label>
					</div>
					<button class="button_highlight" type="submit">
						<i class="icon">save</i> Save
					</button>
				</div>
			</form>
		</div>
	{/if}
</section>

<br/>

<div class="table_scroll">
	<h2>Pending reporters</h2>
	<AbuseReporterTable
		reporters={reporters_pending}
		on:edit={e => edit_reporter(e.detail)}
		on:approve={e => approve_reporter(e.detail)}
		on:spam={e => spam_reporter(e.detail)}
		on:delete={e => delete_reporter(e.detail)}>
	</AbuseReporterTable>


	<h2>Trusted reporters</h2>
	<AbuseReporterTable
		reporters={reporters_trusted}
		on:edit={e => edit_reporter(e.detail)}
		on:approve={e => approve_reporter(e.detail)}
		on:spam={e => spam_reporter(e.detail)}
		on:delete={e => delete_reporter(e.detail)}>
	</AbuseReporterTable>

	<h2>Rejected reporters</h2>
	<AbuseReporterTable
		reporters={reporters_rejected}
		on:edit={e => edit_reporter(e.detail)}
		on:approve={e => approve_reporter(e.detail)}
		on:spam={e => spam_reporter(e.detail)}
		on:delete={e => delete_reporter(e.detail)}>
	</AbuseReporterTable>
</div>
<br/>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
.table_scroll {
	text-align: left;
}
</style>
