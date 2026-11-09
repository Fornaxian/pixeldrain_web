<script lang="ts">
import { formatDataVolume } from "util/Formatting";
import { fs_encode_path, fs_node_icon } from "filesystem/FilesystemAPI"
import type { FSNavigator } from "filesystem/FSNavigator";
import SortButton from "layout/SortButton.svelte";
import { FileAction, type FileEvent } from "./FileManagerLib";

let {
	nav,
	on_file,
	show_hidden = false,
	large_icons = false,
	hide_edit = false,
	hide_branding = false
}: {
	nav: FSNavigator;
	on_file: (e: FileEvent) => void;
	show_hidden?: boolean;
	large_icons?: boolean;
	hide_edit?: boolean;
	hide_branding?: boolean;
} = $props();
</script>

<table class="directory">
	<thead>
		<tr>
			<td></td>
			<td><SortButton active_field={$nav.sort_last_field} asc={$nav.sort_asc} sort_func={nav.sort_children} field="name">Name</SortButton></td>
			<td><SortButton active_field={$nav.sort_last_field} asc={$nav.sort_asc} sort_func={nav.sort_children} field="file_size">Size</SortButton></td>
			<td></td>
		</tr>
	</thead>
	<tbody>
	{#each $nav.children as child, index (child.path)}
		<tr
			onclick={e => on_file({index: index, action: FileAction.Click, original: e})}
			oncontextmenu={e => on_file({index: index, action: FileAction.Context, original: e})}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
		>
			<td>
				<img src={fs_node_icon(child, 64, 64)} class="node_icon" class:large_icons alt="icon"/>
			</td>
			<td class="node_name">
				<a href={"/d"+fs_encode_path(child.path)}>{child.name}</a>
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
							onclick={e => on_file({index: index, action: FileAction.Share, original: e})}
							class="button action_button"
						>
							<i class="icon" title="This file / directory is shared. Click to open public link">share</i>
						</a>
					{/if}
					{#if child.properties !== undefined && child.properties.branding_enabled === "true" && !hide_branding}
						<button class="action_button" onclick={e => on_file({index: index, action: FileAction.Branding, original: e})}>
							<i class="icon">palette</i>
						</button>
					{/if}
					{#if $nav.permissions.write && !hide_edit}
						<button class="action_button" onclick={e => on_file({index: index, action: FileAction.Edit, original: e})}>
							<i class="icon">edit</i>
						</button>
					{/if}
					<button class="action_button" onclick={e => on_file({index: index, action: FileAction.Download, original: e})}>
						<i class="icon">save</i>
					</button>
				</div>
			</td>
		</tr>
	{/each}
	</tbody>
</table>

<style>
.directory {
	margin: 8px auto 16px auto;
	background: var(--shaded_background);
	border-collapse: collapse;
	border-radius: 8px;

	max-width: 99%;
	width: 1200px;
}
.node {
	color: var(--body_text-color);
	cursor: pointer;
}
.node:last-child {
	border-bottom: none;
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
.node > td {
	padding: 1px;
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
.node_name > a {
	display: block;
	color: inherit;
	text-decoration: none;
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
