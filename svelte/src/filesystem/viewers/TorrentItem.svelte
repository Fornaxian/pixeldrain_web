<script lang="ts">
import { formatDataVolume } from "util/Formatting";
import type { TorrentFile } from "./Torrent.svelte";

export let item: TorrentFile = {} as TorrentFile
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
