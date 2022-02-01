<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";
import Euro from "../util/Euro.svelte"

let loading = false
let months = []

const load_activity = async () => {
	loading = true
	try {
		// We keep fetching history until we have fetched two months without
		// any activity
		let empty_months = 0
		let now = new Date()
		while (empty_months < 2) {
			const resp = await fetch(
				window.api_endpoint+"/user/activity/" +
					now.getFullYear()+"-"+("00"+(now.getMonth()+1)).slice(-2),
			)
			if(resp.status >= 400) {
				let json = await resp.json()
				if (json.value === "authentication_failed") {
					window.location = "/login"
					return
				} else {
					throw new Error(json.message)
				}
			}

			let month = {
				rows: await resp.json(),
				month: now.getFullYear()+"-"+("00"+(now.getMonth()+1)).slice(-2),
			}

			if (month.rows.length === 0) {
				empty_months++
				continue
			}
			months.push(month)
			months = months

			// Fetch the previous month
			now.setMonth(now.getMonth()-1)
		}
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
};
onMount(() => {
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

	{#each months as month}
		<h3>{month.month}</h3>
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
					{#each month.rows as row}
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
								{row.file_name}
							</td>
							<td>
								{row.file_removal_reason}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
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
</style>
