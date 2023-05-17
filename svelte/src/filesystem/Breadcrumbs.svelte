<script>
export let state = {}
export let navigator
</script>

{#each state.path as node, i (node.path)}
	<a
		href={state.path_root+node.path}
		class="breadcrumb button"
		class:button_highlight={state.base_index === i}
		on:click|preventDefault={() => {navigator.navigate(node.path, true)}}>
		{node.name}
	</a>
{/each}

<style>
.breadcrumb {
	min-width: 1em;
	text-align: center;
	padding: 6px 8px;
	margin: 4px;
	word-break: break-all;
}
</style>
