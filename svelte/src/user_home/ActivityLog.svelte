<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = false

let year = 0
let month = 0
let month_str = ""
let data = []

const load_activity = async () => {
	loading = true
	month_str = year + "-" + ("00"+(month)).slice(-2)
	try {
		const resp = await fetch(window.api_endpoint+"/user/activity/" + month_str)
		if(resp.status >= 400) {
			let json = await resp.json()
			if (json.value === "authentication_failed") {
				window.location = "/login"
				return
			} else {
				throw new Error(json.message)
			}
		}

		data = await resp.json()
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
};
const last_month = () => {
	month--
	if (month === 0) {
		month = 12
		year--
	}

	load_activity()
}
const next_month = () => {
	month++
	if (month === 13) {
		month = 1
		year++
	}

	load_activity()
}
onMount(() => {
	let now = new Date()
	year = now.getFullYear()
	month = now.getMonth()+1

	load_activity()
})
</script>

{#if loading}
	<div class="spinner_container">
		<Spinner />
	</div>
{/if}

<section>
	<h2>Account activity log</h2>
	<p>
		Here you can see files that have recently expired or have been blocked
		for breaking the content policy.
	</p>

	<h3>{month_str}</h3>
	<div class="toolbar">
		<button on:click={last_month}>
			<i class="icon">chevron_left</i>
			Previous month
		</button>
		<div class="toolbar_spacer"></div>
		<button on:click={next_month}>
			Next month
			<i class="icon">chevron_right</i>
		</button>
	</div>

	<div class="table_scroll">
		<table style="text-align: left;">
			<thead>
				<tr>
					<td>Time</td>
					<td>Event</td>
					<td>File name</td>
					<td>File removal reason</td>
				</tr>
			</thead>
			<tbody>
				{#each data as row}
					<tr>
						<td>
							{formatDate(row.time, true, true, false)}
						</td>
						<td>
							{#if row.event === "file_instance_blocked"}
								File blocked for abuse
							{:else if row.event === "file_instance_expired"}
								File expired
							{/if}
						</td>
						<td>
							{#if row.event === "file_instance_blocked"}
								<a href="/u/{row.file_id}">{row.file_name}</a>
							{:else}
								{row.file_name}
							{/if}
						</td>
						<td>
							{row.file_removal_reason}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.length > 100}
		<div class="toolbar">
			<button on:click={last_month}>
				<i class="icon">chevron_left</i>
				Previous month
			</button>
			<div class="toolbar_spacer"></div>
			<button on:click={next_month}>
				Next month
				<i class="icon">chevron_right</i>
			</button>
		</div>
	{/if}
</section>

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
