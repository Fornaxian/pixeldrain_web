<script>
export let state = {}
export let fs_navigator
</script>

{#each state.path as node, i (node.path)}
	{@const shared = node.id !== undefined && node.id !== "me"}
	<a
		href={state.path_root+node.path}
		class="breadcrumb button"
		class:button_highlight={state.base_index === i}
		on:click|preventDefault={() => {fs_navigator.navigate(node.path, true)}}
	>
		{#if shared}
			<i class="icon small">share</i>
		{/if}
		<div class="node_name" class:nopad={shared}>
			{node.name}
		</div>
	</a>
{/each}

<style>
.breadcrumb {
	min-width: 1em;
	text-align: center;
	margin: 4px;
	word-break: break-all;
	padding: 0;
	display: flex;
	flex-direction: row;
}
.node_name {
	margin: 6px 8px;
}
.nopad {
	margin-left: 0;
}
.icon {
	margin: 2px 4px;
}
</style>
