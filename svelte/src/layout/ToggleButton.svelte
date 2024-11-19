<script lang="ts">
export let on = false
export let group_first = false
export let group_middle = false
export let group_last = false
</script>

<button
	on:click={() => on = !on}
	type="button"
	class="button"
	class:button_highlight={on}
	class:group_first
	class:group_middle
	class:group_last
>
	{#if on}
		<i class="icon">check</i>
	{:else}
		<i class="icon">close</i>
	{/if}

	<slot></slot>
</button>

<style>
.button {
	flex: 0 0 content;
}
</style>
