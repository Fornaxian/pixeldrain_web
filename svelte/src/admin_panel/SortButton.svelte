<script>
export let field = ""
export let active_field = ""
export let asc = true
export let sort_func
</script>

<button class:button_highlight={active_field === field} on:click={() => sort_func(field)}>
	{#if active_field === field}
		{#if asc}
			↓
		{:else}
			↑
		{/if}
	{/if}
	<slot></slot>
</button>

<style>
button {
	margin: 0;
	line-height: 1em;
}
</style>
