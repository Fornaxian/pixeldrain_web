<script>
import { createEventDispatcher } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Modal from "../util/Modal.svelte"

let dispatch = createEventDispatcher()
export let reporters = []

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
				<button on:click|preventDefault={() => toggle_preview(rep)} class="button round">
					<i class="icon">visibility</i>
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
</table>

<Modal bind:this={modal} title={preview_subject} width="1000px">
	{#if preview_html !== ""}
		<div class="message_html">{@html preview_html}</div>
	{:else if preview_text !== ""}
		<div class="message_pre">{preview_text}</div>
	{/if}
</Modal>

<style>
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
