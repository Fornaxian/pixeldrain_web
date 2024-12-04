<script>
import { formatDataVolume } from "../../util/Formatting.svelte";

export let item = {
	download_url: "",
	size: 0,
	children: null,
}
</script>

<!-- First get directories and render them as details collapsibles -->
{#each Object.entries(item.children) as [name, child]}
	{#if child.children}
		<details bind:open={child.details_open}>
			<summary>
				{name} ({formatDataVolume(child.size, 3)})
			</summary>

			<!-- Performance optimization, only render children if details is expanded -->
			{#if child.details_open}
				<svelte:self item={child}></svelte:self>
			{/if}
		</details>
	{/if}
{/each}

<!-- Then get files and render them as list items -->
<ul>
	{#each Object.entries(item.children) as [name, child]}
		{#if !child.children}
			<li>
				{#if child.download_url}
					<a href={child.download_url}>{name}</a>
				{:else}
					{name}
				{/if}
				({formatDataVolume(child.size, 3)})<br/>
			</li>
		{/if}
	{/each}
</ul>

<style>
details {
	padding-left: 12px;
	border: none;
	border-left: 2px solid var(--separator);
}
ul {
	margin: 0;
	padding-left: 30px;
	border-left: 2px solid var(--separator);
}
</style>
