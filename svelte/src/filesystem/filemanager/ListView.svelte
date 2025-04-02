<script lang="ts">
import { createEventDispatcher } from "svelte";
import { formatDataVolume } from "util/Formatting";
import { fs_encode_path, fs_node_icon } from "filesystem/FilesystemAPI"
import type { FSNavigator } from "filesystem/FSNavigator";
import SortButton from "layout/SortButton.svelte";
import { flip } from "svelte/animate";

let dispatch = createEventDispatcher()

export let nav: FSNavigator
export let show_hidden = false
export let large_icons = false
export let hide_edit = false
export let hide_branding = false
</script>

<div class="directory">
	<tr>
		<td></td>
		<td><SortButton active_field={$nav.sort_last_field} asc={$nav.sort_asc} sort_func={nav.sort_children} field="name">Name</SortButton></td>
		<td><SortButton active_field={$nav.sort_last_field} asc={$nav.sort_asc} sort_func={nav.sort_children} field="file_size">Size</SortButton></td>
		<td></td>
	</tr>
	{#each $nav.children as child, index (child.path)}
		<a
			href={"/d"+fs_encode_path(child.path)}
			on:click|preventDefault={e => dispatch("node_click", {index: index, original: e})}
			on:contextmenu={e => dispatch("node_context", {index: index, original: e})}
			animate:flip={{duration: 500}}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
		>
			<td>
				<img src={fs_node_icon(child, 64, 64)} class="node_icon" class:large_icons alt="icon"/>
			</td>
			<td class="node_name">
				{child.name}
			</td>
			<td class="node_size hide_small">
				{#if child.type === "file"}
					{formatDataVolume(child.file_size, 3)}
				{/if}
			</td>
			<td class="node_icons">
				<div class="icons_wrap">
					{#if child.abuse_type !== undefined}
						<i class="icon" title="This file / directory has received an abuse report. It cannot be shared">block</i>
					{:else if child.id}
						<a
							href="/d/{child.id}"
							on:click|preventDefault|stopPropagation={e => {dispatch("node_share_click", {index: index, original: e})}}
							class="button action_button"
						>
							<i class="icon" title="This file / directory is shared. Click to open public link">share</i>
						</a>
					{/if}
					{#if child.properties !== undefined && child.properties.branding_enabled === "true" && !hide_branding}
						<button class="action_button" on:click|preventDefault|stopPropagation={e => dispatch("node_branding", {index: index, original: e})}>
							<i class="icon">palette</i>
						</button>
					{/if}
					{#if $nav.permissions.write && !hide_edit}
						<button class="action_button" on:click|preventDefault|stopPropagation={e => dispatch("node_settings", {index: index, original: e})}>
							<i class="icon">edit</i>
						</button>
					{/if}
				</div>
			</td>
		</a>
	{/each}
</div>

<style>
.directory {
	display: table;
	margin: 8px auto 16px auto;
	background: var(--shaded_background);
	border-collapse: collapse;
	border-radius: 8px;

	max-width: 99%;
	width: 1200px;
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
	color: var(--body_text-color);
	padding: 6px;
}
.node:not(:last-child) {
	border-bottom: 1px solid var(--separator);
}
.node:hover:not(.node_selected) {
	background: var(--input_hover_background);
	color: var(--input_text);
	text-decoration: none;
}
.node.node_selected {
	background-color: var(--highlight_color) !important;
	color: var(--highlight_text_color);
}
td {
	vertical-align: middle;
}
.node_icon {
	height: 32px;
	width: 32px;
	vertical-align: middle;
	border-radius: 4px;
	margin: 2px;
}
.node_name {
	width: 100%;
	line-height: 1.2em;
	word-break: break-all;
}
.node_size {
	min-width: 5em;
	white-space: nowrap;
}
.icons_wrap {
	display: flex;
	flex-direction: row;
	justify-content: end;
}
.hidden {
	display: none;
}

/* Large icon mode only supported on wide screens */
@media (min-width: 500px) {
	.node_icon.large_icons {
		height: 64px;
		width: 64px;
	}
}
@media (max-width: 500px) {
	.hide_small {
		display: none;
	}
}
</style>
