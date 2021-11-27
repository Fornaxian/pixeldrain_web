<script>
import { formatDate } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = false
let loaded = false
let rows = []

const load_keys = async () => {
	loading = true
	try {
		const resp = await fetch(window.api_endpoint+"/user/session")
		if(resp.status >= 400) {
			let json = await resp.json()
			if (json.value === "authentication_failed") {
				window.location = "/login"
				return
			} else {
				throw new Error(json.message)
			}
		}
		rows = await resp.json()
		rows.forEach(row => {
			row.creation_date = new Date(row.creation_time)
			row.last_used_date = new Date(row.last_used_time)
		})
		rows.sort((a, b) => {
			return b.last_used_date - a.last_used_date
		});
	} catch (err) {
		alert(err)
	} finally {
		loading = false
		loaded = true
	}
};

const create_key = async () => {
	loading = true
	try {
		const resp = await fetch(
			window.api_endpoint+"/user/session",
			{ method: "POST" }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to create new API key! "+err)
	}

	load_keys();
}

const logout = async (key) => {
	loading = true

	try {
		const resp = await fetch(
			window.api_endpoint+"/user/session",
			{
				method: "DELETE",
				headers: {
					"Authorization": "Basic "+btoa(":"+key),
				}
			}
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to delete key: "+err)
	}

	load_keys();
}
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}
	<div class="limit_width">
		{#if !loaded}
			<div class="highlight_yellow">
				<h2>Warning</h2>
				<p>
					API keys are sensitive information. They can be used to gain
					full control over your account. Do not show your API keys to
					someone or something you don't trust!
				</p>
				<button class="button_red" on:click={load_keys}>
					<i class="icon">lock_open</i> Show API keys
				</button>
			</div>
		{:else}
			<div class="toolbar" style="text-align: left;">
				<div class="toolbar_spacer"></div>
				<button on:click={create_key}>
					<i class="icon">add</i> Create new API key
				</button>
			</div>
		{/if}

		<p>
			If you delete the API key that you are currently using you will be
			logged out of your account. API keys expire 90 days after the last
			time they're used. If you think someone is using your account
			without your authorization it's probably a good idea to delete all
			your keys.
		</p>
	</div>
	<div class="table_scroll">
		<table style="text-align: left;">
			<tr>
				<td>Key</td>
				<td>Created</td>
				<td>Last used ▼</td>
				<td>IP address</td>
				<td></td>
			</tr>
			{#each rows as row (row.auth_key)}
				<tr style="border-bottom: none;">
					<td>{row.auth_key}</td>
					<td>{formatDate(row.creation_time, true, true, false)}</td>
					<td>{formatDate(row.last_used_time, true, true, false)}</td>
					<td>{row.creation_ip_address}</td>
					<td>
						<button on:click|preventDefault={() => {logout(row.auth_key)}} class="button button_red round">
							<i class="icon">delete</i>
						</button>
					</td>
				</tr>
				<tr>
					<td colspan="5">User-Agent: {row.user_agent}</td>
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
