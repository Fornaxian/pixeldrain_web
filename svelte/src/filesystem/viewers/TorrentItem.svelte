<script>
import { formatDataVolume } from "util/Formatting.svelte";

export let item = {
	size: 0,
	children: null,
}
</script>

<ul class="list_open">
	{#each Object.entries(item.children) as [name, child]}
		<li class:list_closed={!child.children}>
			{name} ({formatDataVolume(child.size, 3)})<br/>
			{#if child.children}
				<svelte:self item={child}></svelte:self>
			{/if}
		</li>
	{/each}
</ul>

<style>
.list_open {
	list-style-type: disclosure-open;
}
.list_closed {
	list-style-type: disc;
}
</style>
