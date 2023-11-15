<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume } from "../../util/Formatting.svelte";
import { fs_encode_path, fs_node_icon } from "../FilesystemUtil";

let dispatch = createEventDispatcher()

export let state
export let show_hidden = false
</script>

<div class="directory">
	<tr>
		<td></td>
		<td>Name</td>
		<td>Size</td>
		<td></td>
	</tr>
	{#each state.children as child, index (child.path)}
		<a
			href={"/d"+fs_encode_path(child.path)}
			on:click|preventDefault={() => {dispatch("node_click", index)}}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
		>
			<td>
				<img src={fs_node_icon(child, 32, 32)} class="node_icon" alt="icon"/>
			</td>
			<td class="node_name">
				{child.name}
			</td>
			<td class="node_size">
				{#if child.type === "file"}
					{formatDataVolume(child.file_size, 3)}
				{/if}
			</td>
			<td class="node_icons">
				{#if child.id}
					<a
						href="/d/{child.id}"
						on:click|preventDefault|stopPropagation={() => {dispatch("node_share_click", index)}}
						class="button action_button"
					>
						<i class="icon" title="This file / directory is shared. Click to open public link">share</i>
					</a>
				{/if}
				{#if state.permissions.update}
					<button class="action_button" on:click|preventDefault|stopPropagation={() => {dispatch("node_settings", index)}}>
						<i class="icon">edit</i>
					</button>
				{/if}
			</td>
		</a>
	{/each}
</div>

<style>

.directory {
	display: table;
	position: relative;
	overflow: hidden;
	margin: 8px auto 16px auto;
	text-align: left;
	background: var(--body_color);
	border-collapse: collapse;
	border-radius: 8px;

	max-width: 100%;
	width: 1000px;
}
.directory > * {
	display: table-row;
}
.directory > * > * {
	display: table-cell;
}
.node {
	display: table-row;
	text-decoration: none;
	color: var(--text-color);
	padding: 6px;
}
.node:not(:last-child) {
	border-bottom: 1px solid var(--separator);
}
.node:hover:not(.node_selected) {
	background: var(--input_background);
	color: var(--input_text);
	text-decoration: none;
}
.node.node_selected {
	background-color: var(--highlight_color) !important;
	color: var(--highlight_text_color);
}
td {
	padding: 4px;
	vertical-align: middle;
}
.node_icon {
	height: 32px;
	width: 32px;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	width: 100%;
	overflow: hidden;
	line-height: 1.2em;
	word-break: break-all;
}
.node_size {
	min-width: 50px;
	white-space: nowrap;
}
.node_icons {
	white-space: nowrap;
	text-align: right;
	padding: 0;
}
.action_button {
	margin: 0;
	background: none;
}
.hidden {
	display: none;
}
</style>
