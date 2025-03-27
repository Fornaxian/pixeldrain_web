<script>
import Button from "layout/Button.svelte";

// {icon: "", label: ""}
export let tabs = []
export let active = 0

export const open_tab = (name = "") => {
	for (let i = 0; i < tabs.length; i++) {
		if (tabs[i].name === name) {
			active = i
			return
		}
	}
}
</script>

<div class="tab_bar">
	{#each tabs as t, i}
		<Button
			icon={t.icon}
			label={t.label}
			highlight={i === active}
			click={() => active = i}
		/>
	{/each}
</div>

<!-- Can't find a way to do this dynamically unfortunately-->
{#if active === 0}
	<slot name="0"></slot>
{:else if active === 1}
	<slot name="1"></slot>
{:else if active === 2}
	<slot name="2"></slot>
{:else if active === 3}
	<slot name="3"></slot>
{:else if active === 4}
	<slot name="4"></slot>
{:else if active === 5}
	<slot name="5"></slot>
{:else if active === 6}
	<slot name="6"></slot>
{:else if active === 7}
	<slot name="7"></slot>
{:else if active === 8}
	<slot name="8"></slot>
{:else if active === 9}
	<slot name="9"></slot>
{/if}

<style>
.tab_bar {
	border-bottom: 2px solid var(--separator);
}
</style>
