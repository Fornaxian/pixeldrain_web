<script>
import { fs_encode_path } from "./FilesystemUtil";

export let state = {}
export let fs_navigator
</script>

<div class="breadcrumbs">
	{#each state.path as node, i (node.path)}
		{@const shared = node.id !== undefined && node.id !== "me"}
		<a
			href={"/d"+fs_encode_path(node.path)}
			class="breadcrumb button"
			class:button_highlight={state.base_index === i}
			on:click|preventDefault={() => {fs_navigator.navigate(node.path, true)}}
		>
			{#if shared}
				<i class="icon small">share</i>
			{/if}
			<div class="node_name" class:base={state.base_index === i}>
				{node.name}
			</div>
		</a>
	{/each}
</div>

<style>
.breadcrumbs {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	flex-direction: row;
	overflow: hidden;
}
.breadcrumb {
	min-width: 1em;
	text-align: center;
	word-break: break-all;
	display: inline-flex;
	flex-direction: row;
	line-height: 1em;
}
.node_name {
	/* This padding makes sure that characters which extend below the
	line-height do not get cut off */
	padding: 4px 2px;
	max-width: 20vw;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.base {
	/* The base name uses all available space */
	max-width: unset;
}
</style>
