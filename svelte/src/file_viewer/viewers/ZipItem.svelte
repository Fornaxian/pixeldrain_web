<script>
import { formatDataVolume } from "util/Formatting.svelte";

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
				<div class="filename">
					{name}
					(
						{formatDataVolume(child.size, 3)}
						{#if child.download_url}
							<a href={child.download_url}>download</a>
						{/if}
					)
				</div>
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
				<div class="filename">
					{name}
					(
						{formatDataVolume(child.size, 3)}
						{#if child.download_url}
							<a href={child.download_url}>download</a>
						{/if}
					)
				</div>
			</li>
		{/if}
	{/each}
</ul>

<style>
details {
	padding-left: 0.5em;
	border: none;
	border-left: 2px solid var(--separator);
}
details > summary {
	list-style-type: none;
	display: flex;
}
details > summary::before {
	font-family: 'Material Icons';
	content: 'folder';
}
details[open] > summary::before {
	font-family: 'Material Icons';
	content: 'folder_open';
}
li::before {
	font-family: 'Material Icons';
	content: 'description';
}
ul {
	list-style-type: none;
	padding-left: 0.5em;
	margin: 0;
	border-left: 2px solid var(--separator);
}
.filename {
	display: inline;
	margin-left: 0.5em;
}
</style>
