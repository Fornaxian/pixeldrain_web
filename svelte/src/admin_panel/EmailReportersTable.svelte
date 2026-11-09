<script lang="ts">
import { formatDate } from "util/Formatting";
import Modal from "util/Modal.svelte"
import SortButton from "layout/SortButton.svelte";
import { flip } from "svelte/animate";

let { reporters = [], on_edit, on_approve, on_spam, on_delete }: {
	reporters?: any[];
	on_edit: (reporter: any) => void;
	on_approve: (reporter: any) => void;
	on_spam: (reporter: any) => void;
	on_delete: (reporter: any) => void;
} = $props();

let sort_field = $state("last_used")
let asc = $state(false)
const sort = (field: string) => {
	if (field === sort_field) asc = !asc
	sort_field = field
	console.log("sorting by", field, "asc", asc)
}

let sorted = $derived([...reporters].sort((a, b) => {
	if (typeof (a[sort_field]) === "number") {
		// Sort ints from high to low
		if (asc) {
			return a[sort_field] - b[sort_field]
		} else {
			return b[sort_field] - a[sort_field]
		}
	} else {
		// Sort strings alphabetically
		if (asc) {
			return a[sort_field].localeCompare(b[sort_field])
		} else {
			return b[sort_field].localeCompare(a[sort_field])
		}
	}
}))

let modal: Modal = $state()
let preview_subject = $state("")
let preview_html = $state("")
let preview_text = $state("")
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
			{#each sorted as rep (rep.from_address)}
				<tr animate:flip={{duration: 500}}>
					<td>{rep.from_address}</td>
					<td>{rep.name}</td>
					<td>{rep.reports_sent}</td>
					<td>{rep.files_blocked}</td>
					<td>{formatDate(rep.last_used, true, true, false)}</td>
					<td>{formatDate(rep.created, false, false, false)}</td>
					<td>
						<button onclick={e => {e.preventDefault(); toggle_preview(rep)}} class="button round" title="Show last message">
							<i class="icon i_email"></i>
						</button>
						<button onclick={e => {e.preventDefault(); on_edit(rep)}} class="button round" title="Edit">
							<i class="icon i_edit"></i>
						</button>
						{#if rep.status !== "trusted"}
							<button onclick={e => {e.preventDefault(); on_approve(rep)}} class="button button_highlight round" title="Trust">
								<i class="icon i_check"></i>
							</button>
						{/if}
						{#if rep.status !== "rejected"}
							<button onclick={e => {e.preventDefault(); on_spam(rep)}} class="button button_red round" title="Reject">
								<i class="icon i_block"></i>
							</button>
						{/if}
						<button onclick={e => {e.preventDefault(); on_delete(rep)}} class="button button_red round" title="Delete">
							<i class="icon i_delete"></i>
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
