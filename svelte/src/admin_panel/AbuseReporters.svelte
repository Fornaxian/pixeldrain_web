<script>
import { onMount } from "svelte";
import { formatDate, formatDuration } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = true
let reporters = []

let creating = false
let new_reporter_email
let new_reporter_name
let new_reporter_type = "individual"

const get_reporters = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/admin/abuse_reporter");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		reporters = await resp.json();
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

const create_reporter = async () => {
	if (!new_reporter_email.value) {
		alert("Please enter an e-mail address!")
		return
	} else if (!new_reporter_name.value) {
		alert("Please enter a name!")
		return
	} else if (!new_reporter_type) {
		alert("Please enter a type!")
		return
	}

	try {
		const form = new FormData()
		form.append("email", new_reporter_email.value)
		form.append("name", new_reporter_name.value)
		form.append("type", new_reporter_type)

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

const delete_reporter = async (email) => {
	if (!confirm("Delete this reporter address?\n\n"+email)) {
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/admin/abuse_reporter/"+encodeURI(email),
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
				<i class="icon">create</i> Add abuse reporter
			</button>
		</div>
		{#if creating}
			<div class="highlight_light">
				<form on:submit|preventDefault={create_reporter}>
					<table class="form">
						<tr>
							<td>E-mail address</td>
							<td><input type="text" bind:this={new_reporter_email}/></td>
						</tr>
						<tr>
							<td>Name</td>
							<td><input type="text" bind:this={new_reporter_name} value="Anonymous tip"/></td>
						</tr>
						<tr>
							<td>Type</td>
							<td>
								<input id="reporter_type_individual" name="reporter_type" type="radio" bind:group={new_reporter_type} value="individual" />
								<label for="reporter_type_individual">Individual</label>
								<br/>
								<input id="reporter_type_org" name="reporter_type" type="radio" bind:group={new_reporter_type} value="org" />
								<label for="reporter_type_org">Organisation</label>
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

	<div class="table_scroll">
		<table style="text-align: left;">
			<tr>
				<td>E-mail</td>
				<td>Name</td>
				<td>Blocked</td>
				<td>Type</td>
				<td>Last used</td>
				<td>Created</td>
				<td></td>
			</tr>
			{#each reporters as reporter}
				<tr>
					<td>{reporter.email}</td>
					<td>{reporter.name}</td>
					<td>{reporter.files_blocked}</td>
					<td>{reporter.type}</td>
					<td>{formatDate(reporter.last_used, true, true, false)}</td>
					<td>{formatDate(reporter.created, false, false, false)}</td>
					<td>
						<button on:click|preventDefault={() => {delete_reporter(reporter.email)}} class="button button_red round">
							<i class="icon">delete</i>
						</button>
					</td>
				</tr>
			{/each}
		</table>
	</div>
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
