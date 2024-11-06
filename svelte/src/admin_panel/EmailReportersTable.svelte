<script>
import { createEventDispatcher } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Modal from "../util/Modal.svelte"
import SortButton from "./SortButton.svelte";
import { flip } from "svelte/animate";

const dispatch = createEventDispatcher()

export let reporters = []

$: update_table(reporters)
const update_table = (reporters) => sort("")

let sort_field = "last_used"
let asc = false
const sort = (field) => {
	if (field !== "" && field === sort_field) asc = !asc
	if (field === "") field = sort_field
	sort_field = field

	console.log("sorting by", field, "asc", asc)
	reporters.sort((a, b) => {
		if (typeof (a[field]) === "number") {
			// Sort ints from high to low
			if (asc) {
				return a[field] - b[field]
			} else {
				return b[field] - a[field]
			}
		} else {
			// Sort strings alphabetically
			if (asc) {
				return a[field].localeCompare(b[field])
			} else {
				return b[field].localeCompare(a[field])
			}
		}
	})
	reporters = reporters
}

let modal
let preview_subject = ""
let preview_html = ""
let preview_text = ""
const toggle_preview = (rep) => {
	preview_subject = rep.last_message_subject
	preview_text = rep.last_message_text
	preview_html = rep.last_message_html
	modal.show()
}
</script>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td><SortButton field="from_address" active_field={sort_field} asc={asc} sort_func={sort}>Address</SortButton></td>
				<td><SortButton field="name" active_field={sort_field} asc={asc} sort_func={sort}>Name</SortButton></td>
				<td><SortButton field="reports_sent" active_field={sort_field} asc={asc} sort_func={sort}>Reports</SortButton></td>
				<td><SortButton field="files_blocked" active_field={sort_field} asc={asc} sort_func={sort}>Blocked</SortButton></td>
				<td><SortButton field="last_used" active_field={sort_field} asc={asc} sort_func={sort}>Last used</SortButton></td>
				<td><SortButton field="created" active_field={sort_field} asc={asc} sort_func={sort}>Created</SortButton></td>
				<td></td>
			</tr>
		</thead>
		<tbody>
			{#each reporters as rep (rep.from_address)}
				<tr animate:flip={{duration: 500}}>
					<td>{rep.from_address}</td>
					<td>{rep.name}</td>
					<td>{rep.reports_sent}</td>
					<td>{rep.files_blocked}</td>
					<td>{formatDate(rep.last_used, true, true, false)}</td>
					<td>{formatDate(rep.created, false, false, false)}</td>
					<td>
						<button on:click|preventDefault={() => toggle_preview(rep)} class="button round">
							<i class="icon">email</i>
						</button>
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
		</tbody>
	</table>
</div>

<Modal bind:this={modal} title={preview_subject} width="1000px">
	{#if preview_html !== ""}
		<div class="message_html">{@html preview_html}</div>
	{:else if preview_text !== ""}
		<div class="message_pre">{preview_text}</div>
	{/if}
</Modal>

<style>
.table_scroll {
	text-align: initial;
}
.message_html {
	padding: 8px;
	text-align: initial;
	white-space: normal;
	overflow: hidden;
}
.message_pre {
	padding: 8px;
	text-align: initial;
	white-space: pre-wrap;
	overflow: hidden;
}
</style>
