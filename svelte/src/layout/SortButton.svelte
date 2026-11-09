<script lang="ts">
let {
	field = "",
	active_field = "",
	asc = true,
	sort_func,
	children
}: {
	field?: string;
	active_field?: string;
	asc?: boolean;
	sort_func: (field: string) => void;
	children?: import('svelte').Snippet;
} = $props();
</script>

<button class:button_highlight={active_field === field} onclick={() => sort_func(field)}>
	{#if active_field === field}
		{#if asc}↓{:else}↑{/if}
	{/if}
	{@render children?.()}
</button>

<style>
button {
	display: block;
	margin: 0;
	line-height: 1em;
	width: 100%;
	text-align: center;
}
</style>
