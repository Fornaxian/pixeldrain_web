<script>
import { onMount, tick } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import EmailReportersTable from "./EmailReportersTable.svelte";

let loading = true
let reporters = []
$: reporters_pending = reporters.reduce((acc, val) => {
	if (val.status === "pending") {
		acc.push(val)
	}
	return acc
}, [])
$: reporters_trusted = reporters.reduce((acc, val) => {
	if (val.status === "trusted") {
		acc.push(val)
	}
	return acc
}, [])
$: reporters_rejected = reporters.reduce((acc, val) => {
	if (val.status === "rejected") {
		acc.push(val)
	}
	return acc
}, [])

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
let new_reporter_name
let new_reporter_status = "trusted"

const create_reporter = async () => {
	if (!new_reporter_from_address.value) {
		alert("Please enter an e-mail address")
		return
	} else if (!new_reporter_name.value) {
		alert("Please enter a name")
		return
	} else if (!new_reporter_status) {
		alert("Please enter a status")
		return
	}

	await save_reporter(
		new_reporter_from_address.value,
		new_reporter_name.value,
		new_reporter_status,
	)

	creating = false
}

const approve_reporter = reporter => save_reporter(reporter.from_address, reporter.name, "trusted")
const spam_reporter = reporter => save_reporter(reporter.from_address, reporter.name, "rejected")

const save_reporter = async (from, name, status) => {
	try {
		const form = new FormData()
		form.append("from_address", from)
		form.append("name", name !== "" ? name : from)
		form.append("status", status)

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
	await get_reporters();
}

const edit_reporter = async reporter => {
	edit_button.scrollIntoView()
	creating = true
	await tick()
	new_reporter_from_address.value = reporter.from_address
	new_reporter_name.value = reporter.name
	new_reporter_status = reporter.status
}

const delete_reporter = async reporter => {
	const index = reporters.indexOf(reporter)
	if (index > -1) {
		reporters.splice(index, 1)
		reporters = reporters
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_reporter/"+encodeURI(reporter.from_address),
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
		<button on:click={() => get_reporters()}>
			<i class="icon">refresh</i>
		</button>
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
					<label for="field_name">Name</label>
					<input id="field_name" type="text" bind:this={new_reporter_name}/>
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

<h2>Pending reporters</h2>
<EmailReportersTable
	reporters={reporters_pending}
	on:edit={e => edit_reporter(e.detail)}
	on:approve={e => approve_reporter(e.detail)}
	on:spam={e => spam_reporter(e.detail)}
	on:delete={e => delete_reporter(e.detail)}>
</EmailReportersTable>


<h2>Trusted reporters</h2>
<EmailReportersTable
	reporters={reporters_trusted}
	on:edit={e => edit_reporter(e.detail)}
	on:approve={e => approve_reporter(e.detail)}
	on:spam={e => spam_reporter(e.detail)}
	on:delete={e => delete_reporter(e.detail)}>
</EmailReportersTable>

<h2>Rejected reporters</h2>
<EmailReportersTable
	reporters={reporters_rejected}
	on:edit={e => edit_reporter(e.detail)}
	on:approve={e => approve_reporter(e.detail)}
	on:spam={e => spam_reporter(e.detail)}
	on:delete={e => delete_reporter(e.detail)}>
</EmailReportersTable>
<br/>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
</style>
