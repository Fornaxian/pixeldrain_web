<script>
import { createEventDispatcher } from "svelte";
import IconBlock from "../../layout/IconBlock.svelte";
import { fs_thumbnail_url } from "../FilesystemAPI";
import TextBlock from "../../layout/TextBlock.svelte"
let dispatch = createEventDispatcher()

export let nav
</script>

<slot></slot>

<h1>{$nav.base.name}</h1>

<IconBlock icon_href={fs_thumbnail_url($nav.base.path, 256, 256)}>
	Type: {$nav.base.file_type}<br/>
	No preview is available for this file type. Download to view it locally.
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

{#if $nav.base.path === "/me/.search_index.gz"}
	<TextBlock>
		<p>
			Congratulations! You have found the search index. One of the
			filesystem's dirty little secrets.
		</p>
		<p>
			I needed a place to store an index of each user's files so I could
			make them searchable. Now, there are search databases like
			ElasticSearch and such, but that's a lot of work to set up and
			maintain.. Instead I opted to simply put the full path of every file
			in your filesystem in a text file. That's what you're looking at
			here. That can add up to a lot of data, but since the paths usually
			have a lot of repetitive elements it compresses incredibly well.
			You'd be hard-pressed to grow this index over even 1 MB. Honestly,
			this search system is incredibly efficient, I'd be surprised if
			EleasticSearch could even match it.
		</p>
		<p>
			This file is updated 10 minutes after the last time you modify a
			file on your filesystem. So if you're constantly uploading and
			deleting files your search index might never update and you will be
			left with stale search results.
		</p>
		<p>
			If you delete this file then search will stop working until the file
			is regenerated 10 minutes later. If you replace this file with a
			different file then that file will be overwritten 10 minutes later.
			And if you replace this file with a directory with the same name
			then search will stop working completely until you delete the
			directory (yes, I tested this case).
		</p>
		<p>
			Each time you type a search term in the search dialog this file gets
			decompressed and searched on the fly. There is no trickery here, the
			file simply gets read line by line. Modern CPUs are incredibly good
			at searching for text. I benchmarked it once, I don't remember the
			exact numbers but it was somewhere along the lines of one gigabyte
			of text per second. Fast enough to be unnoticeable even if you have
			millions of files in your filesystem.
		</p>
	</TextBlock>
{/if}

<style>
h1 {
	text-shadow: 1px 1px 3px var(--shadow_color);
	line-break: anywhere;
}
.icon {
	display: inline-block;
	vertical-align: middle;
}
</style>
