<script>
export let field = ""
export let active_field = ""
export let asc = true
export let sort_func
</script>

<button class:button_highlight={active_field === field} on:click={() => sort_func(field)}>
	{#if asc}
		↓
	{:else}
		↑
	{/if}
	<slot></slot>
</button>

<style>
button {
	margin: 0;
	line-height: 1.2em;
}
</style>
