<script lang="ts">
import ZipItem from "./ZipItem.svelte";
import type { ZipEntry } from "filesystem/viewers/Zip.svelte";
import { formatDataVolume } from "util/Formatting";

let { item = {} as ZipEntry }: {
	item?: ZipEntry;
} = $props();
</script>

<!-- First get directories and render them as details collapsibles -->
{#each Object.entries(item.children) as [name, child]}
	{#if child.children}
		<details bind:open={child.details_open}>
			<summary>
				<i class="icon {child.details_open ? 'i_folder_open' : 'i_folder'}"></i>
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
				<ZipItem item={child}></ZipItem>
			{/if}
		</details>
	{/if}
{/each}

<!-- Then get files and render them as list items -->
<ul>
	{#each Object.entries(item.children) as [name, child]}
		{#if !child.children}
			<li>
				<i class="icon i_description"></i>
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
}
details > summary, li {
	display: flex;
	align-items: center;
}
.icon {
	font-size: 1em;
}
ul {
	list-style-type: none;
	padding-left: 0.5em;
	margin: 0;
	border-left: 2px solid var(--separator);
}
.filename {
	margin-left: 0.5em;
}
</style>
