<script lang="ts">
import { createEventDispatcher } from "svelte";
import { fs_encode_path, fs_node_icon } from "filesystem/FilesystemAPI"
import type { FSNavigator } from "filesystem/FSNavigator";
import { FileAction } from "./FileManagerLib";

let dispatch = createEventDispatcher()

export let nav: FSNavigator
export let show_hidden = false
export let large_icons = false
export let hide_edit = false
</script>

<div class="directory">
	{#each $nav.children as child, index (child.path)}
		<a
			href={"/d"+fs_encode_path(child.path)}
			on:click={e => dispatch("file", {index: index, action: FileAction.Click, original: e})}
			on:contextmenu={e => dispatch("file", {index: index, action: FileAction.Context, original: e})}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".") && !show_hidden}
		>
			<img src={fs_node_icon(child, 64, 64)} class="node_icon" class:large_icons alt="icon"/>
			<div class="node_name">
				{child.name}
			</div>
			{#if child.id}
				<a
					href="/d/{child.id}"
					on:click={e => dispatch("file", {index: index, action: FileAction.Share, original: e})}
					class="button flat action_button"
				>
					<i class="icon" title="This file / directory is shared. Click to open public link">share</i>
				</a>
			{/if}

			{#if $nav.permissions.write && !hide_edit}
				<button
					class="action_button flat"
					on:click={e => dispatch("file", {index: index, action: FileAction.Edit, original: e})}
				>
					<i class="icon">edit</i>
				</button>
			{/if}

			<button
				class="action_button flat"
				on:click={e => dispatch("file", {index: index, action: FileAction.Download, original: e})}
			>
				<i class="icon">save</i>
			</button>
		</a>
	{/each}
</div>

<style>
.directory {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
	gap: 8px;
	padding: 8px;
	max-width: 100%;
	overflow: hidden;
}
.node {
	display: flex;
	flex-direction: row;
	text-decoration: none;
	color: var(--body_text-color);
	padding: 2px;
	align-items: center;
	background: var(--input_background);
	border-radius: 4px;
	box-shadow: 1px 1px 8px 0px var(--shadow_color);
	gap: 6px;
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
.node>* {
	flex: 0 0 content;
}
.node_icon {
	height: 2em;
	width: 2em;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	flex: 1 1 content;
	word-break: break-all;
	line-height: 1em;
}
.hidden {
	display: none;
}
.flat {
	background: none;
	color: var(--body_text_color);
	box-shadow: none;
	margin: 0;
}

/* Large icon mode only supported on wide screens */
@media (min-width: 500px) {
	.node_icon.large_icons {
		height: 4em;
		width: 4em;
	}
}
</style>
