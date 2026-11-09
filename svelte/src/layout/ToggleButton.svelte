<script lang="ts">
let {
	on = $bindable(false),
	icon_on = "check",
	icon_off = "close",
	group_first = false,
	group_middle = false,
	group_last = false,
	action = (e: MouseEvent) => {},
	label = "",
	children
}: {
	on?: boolean;
	icon_on?: string;
	icon_off?: string;
	group_first?: boolean;
	group_middle?: boolean;
	group_last?: boolean;
	action?: (e: MouseEvent) => void;
	// Accessible name for buttons which only contain an icon
	label?: string;
	children?: import('svelte').Snippet;
} = $props();

const click = (e: MouseEvent) => {
	on = !on
	if (typeof action === "function") {
		action(e)
	}
}
</script>

<button
	onclick={click}
	type="button"
	class="button"
	title={label !== "" ? label : null}
	aria-label={label !== "" ? label : null}
	aria-pressed={on}
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
	{@render children?.()}
</button>

<style>
.button {
	flex: 0 0 content;
}
</style>
