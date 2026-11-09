<script lang="ts">
import TorrentItem from "./TorrentItem.svelte";
import { formatDataVolume } from "util/Formatting";
import type { TorrentFile } from "filesystem/viewers/Torrent.svelte";

let { item }: { item: TorrentFile } = $props();
</script>

<ul class="list_open">
	{#each Object.entries(item.children) as [name, child]}
		<li class:list_closed={!child.children}>
			{name} ({formatDataVolume(child.size, 3)})<br/>
			{#if child.children}
				<TorrentItem item={child}></TorrentItem>
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
