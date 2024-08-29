<script>
import { onMount } from "svelte";
import { Navigator } from "../../filesystem/Navigator"
import { fs_encode_path, fs_node_icon } from "../../filesystem/FilesystemUtil";

const nav = new Navigator(false)
onMount(() => {
	nav.navigate("/me", false)
})
</script>

<div class="directory">
	{#each $nav.children as child (child.path)}
		<a
			href={"/d"+fs_encode_path(child.path)}
			class="node"
			class:node_selected={child.fm_selected}
			class:hidden={child.name.startsWith(".")}
		>
			<img src={fs_node_icon(child, 64, 64)} class="node_icon" alt="icon"/>

			<div class="node_name">
				{child.name}
			</div>

			{#if child.id}
				<a href="/d/{child.id}" class="button action_button">
					<i class="icon" title="This file / directory is shared. Click to open public link">share</i>
				</a>
			{/if}
		</a>
	{/each}
</div>

<style>
.directory {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 6px;
}
.node {
	display: flex;
	flex: 1 1 auto;
	flex-direction: row;
	align-content: center;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	color: var(--body_text-color);
	gap: 2px;
	padding: 2px;
	border-radius: 8px;
	width: 250px;
	max-width: 100%;
	border: 1px solid var(--input_background);
}
.node:hover {
	background: var(--input_hover_background);
	color: var(--input_text);
	text-decoration: none;
}
.node > * {
	flex: 0 0 auto;
}
.node_icon {
	height: 32px;
	width: 32px;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	flex: 1 1 auto;
	display: flex;
	align-items: center;
	word-break: break-all;
	line-height: 1.2em;
}
.action_button {
	margin: 0;
	background: none;
	color: var(--body_text_color);
	box-shadow: none;
}
.hidden {
	display: none;
}
</style>
