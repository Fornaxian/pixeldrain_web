<script>
import { fs_encode_path } from "./FilesystemAPI.mjs";

export let nav
</script>

<div class="breadcrumbs">
	{#each $nav.path as node, i (node.path)}
		{@const shared = node.id !== undefined && node.id !== "me"}
		<a
			href={"/d"+fs_encode_path(node.path)}
			class="breadcrumb button"
			class:button_highlight={$nav.base_index === i}
			on:click|preventDefault={() => {nav.navigate(node.path, true)}}
		>
			{#if node.abuse_type !== undefined}
				<i class="icon small">block</i>
			{:else if shared}
				<i class="icon small">share</i>
			{/if}
			<div class="node_name" class:base={$nav.base_index === i}>
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
}
.node_name {
	max-width: 20vw;
	overflow-x: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.base {
	/* The base name uses all available space */
	max-width: unset;
}
</style>
