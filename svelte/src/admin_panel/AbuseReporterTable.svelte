<script>
import { createEventDispatcher } from "svelte";
import { formatDate } from "../util/Formatting.svelte";

let dispatch = createEventDispatcher()
export let reporters = []
</script>

<table>
	<tr>
		<td>Address / Mail server</td>
		<td>Name</td>
		<td>Reports</td>
		<td>Blocked</td>
		<td>Last used</td>
		<td>Created</td>
		<td></td>
	</tr>
	{#each reporters as rep}
		<tr>
			<td>{rep.from_address}</td>
			<td>{rep.name}</td>
			<td>{rep.reports_sent}</td>
			<td>{rep.files_blocked}</td>
			<td>{formatDate(rep.last_used, true, true, false)}</td>
			<td>{formatDate(rep.created, false, false, false)}</td>
			<td>
				<button on:click|preventDefault={() => {dispatch("edit", rep)}} class="button round">
					<i class="icon">edit</i>
				</button>
				{#if rep.status !== "trusted"}
					<button on:click|preventDefault={() => {dispatch("approve", rep)}} class="button button_highlight round">
						<i class="icon">check</i>
					</button>
				{/if}
				{#if rep.status !== "rejected"}
					<button on:click|preventDefault={() => {dispatch("spam", rep)}} class="button button_red round">
						<i class="icon">block</i>
					</button>
				{/if}
				<button on:click|preventDefault={() => {dispatch("delete", rep)}} class="button button_red round">
					<i class="icon">delete</i>
				</button>
			</td>
		</tr>
	{/each}
</table>
