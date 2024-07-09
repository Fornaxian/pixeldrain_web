<script>
import { onMount } from "svelte";
import { formatDate } from "../../util/Formatting.svelte";
import LoadingIndicator from "../../util/LoadingIndicator.svelte";
import Button from "../../layout/Button.svelte";

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

<LoadingIndicator loading={loading}/>

<div class="toolbar">
	<Button click={last_month} icon="chevron_left"/>
	<div class="toolbar_spacer">
		{month_str}
	</div>
	<Button click={next_month} icon="chevron_right"/>
</div>

{#if data.length === 0}
	<div class="center">
		Removed or expired files will show up here
	</div>
{:else}
	<div class="table_scroll">
		<table style="text-align: left;">
			<thead>
				<tr>
					<td>Time</td>
					<td>File name</td>
					<td>Event</td>
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
								<a href="/u/{row.file_id}">{row.file_name}</a>
							{:else if row.event === "filesystem_node_blocked"}
								<a href="/d/{row.file_id}">{row.file_name}</a>
							{:else}
								{row.file_name}
							{/if}
						</td>
						<td>
							{#if row.event === "file_instance_blocked" || row.event === "filesystem_node_blocked"}
								Blocked for abuse
							{:else if row.event === "file_instance_expired"}
								Expired
							{:else if row.event === "file_instance_lost"}
								File has been lost
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}


<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	margin-top: 4px;
}
.toolbar > * {
	flex: 0 0 auto;
}
.toolbar_spacer {
	flex: 1 1 auto;
	text-align: center;
	align-content: center;
	font-size: 1.2em;
}
.center {
	text-align: center;
}
</style>
