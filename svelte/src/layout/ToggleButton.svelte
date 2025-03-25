<script lang="ts">
export let on = false
export let icon_on = "check"
export let icon_off = "close"
export let group_first = false
export let group_middle = false
export let group_last = false
export let action = (e: MouseEvent) => {}

const click = (e: MouseEvent) => {
	on = !on
	if (typeof action === "function") {
		action(e)
	}
}
</script>

<button
	on:click={click}
	type="button"
	class="button"
	class:button_highlight={on}
	class:group_first
	class:group_middle
	class:group_last
>
	{#if on}
		<i class="icon">{icon_on}</i>
	{:else}
		<i class="icon">{icon_off}</i>
	{/if}
	<slot></slot>
</button>

<style>
.button {
	flex: 0 0 content;
}
</style>
