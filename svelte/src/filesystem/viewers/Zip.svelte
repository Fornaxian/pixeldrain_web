<script lang="ts" context="module">
export type ZipEntry = {
	size: number,
	children?: {[index: string]: ZipEntry},
	properties?: string[],
	download_url?: string, // Added by us
	details_open?: boolean, // Added by us
};
</script>
<script lang="ts">
import { createEventDispatcher } from "svelte";
import { formatDataVolume, formatDate } from "util/Formatting"
import ZipItem from "file_viewer/viewers/ZipItem.svelte";
import IconBlock from "layout/IconBlock.svelte";
import TextBlock from "layout/TextBlock.svelte"
import { fs_node_icon, fs_path_url } from "filesystem/FilesystemAPI";
import type { FSNavigator } from "filesystem/FSNavigator";

let dispatch = createEventDispatcher()

export let nav: FSNavigator

let status = "loading"

let zip: ZipEntry = {size: 0} as ZipEntry
let uncomp_size = 0
let comp_ratio = 0
let archive_type = ""
let truncated = false

export const update = async () => {
	if (nav.base.file_type === "application/x-7z-compressed") {
		archive_type = "7z"
	} else {
		archive_type = ""
	}

	try {
		status = "loading"
		nav.set_loading(true)
		let resp = await fetch(fs_path_url(nav.base.path)+"?zip_info")

		if (resp.status >= 400) {
			status = "parse_failed"
			return
		}

		zip = await resp.json() as ZipEntry

		// Check if the zip has the property which allows separate files to be
		// downloaded. If so then we set the download URL for each file
		if (zip.properties !== undefined) {
			if (zip.properties.includes("read_individual_files")) {
				// Set the download URL for each file in the zip
				recursive_set_url(fs_path_url(nav.base.path)+"?zip_file=", zip)
			}
			truncated = zip.properties.includes("truncated")
		}

		uncomp_size = recursive_size(zip)
		comp_ratio = (uncomp_size / nav.base.file_size)
		status = "finished"
	} catch (err) {
		console.error(err)
		status = "parse_failed"
	} finally {
		nav.set_loading(false)
	}
}

const recursive_set_url = (parent_path: string, file: ZipEntry) => {
	file.download_url = parent_path

	if (file.children !== undefined) {
		for (const [name, child] of Object.entries(file.children)) {
			recursive_set_url(file.download_url + "/" + name, child)
		}
	}
}

const recursive_size = (file: ZipEntry) => {
	let size = file.size

	if (file.children !== undefined) {
		for (const v of Object.values(file.children)) {
			size += recursive_size(v)
		}
	}

	// Return the total size of this file and all its children
	return size
}
</script>

<slot></slot>

<h1>{$nav.base.name}</h1>

<IconBlock icon_href={fs_node_icon($nav.base, 256, 256)}>
	{#if archive_type === "7z"}
		This is a 7-zip archive. You will need
		<a href="https://www.7-zip.org/">7-zip</a> or compatible software to
		extract it<br/>
	{/if}

	Compressed size: {formatDataVolume($nav.base.file_size, 3)}<br/>
	{#if !truncated}
		Uncompressed size: {formatDataVolume(zip.size, 3)} (Ratio: {comp_ratio.toFixed(2)}x)<br/>
	{/if}
	Uploaded on: {formatDate($nav.base.created, true, true, true)}
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

{#if status === "finished"}
	<TextBlock>
		<h2>Files in this zip archive</h2>
		{#if truncated}
			<div class="highlight_yellow">
				Due to the large size of this archive, the results have been
				truncated. The list below is incomplete!
			</div>
		{/if}

		<ZipItem item={zip} />
	</TextBlock>
{:else if status === "parse_failed"}
	<TextBlock>
		<p>
			Zip archive could not be parsed. This usually means that the archive
			is encrypted or that it uses an unsupported compression format.
		</p>
	</TextBlock>
{/if}

<style>
h1 {
	text-shadow: 1px 1px 3px var(--shadow_color);
	line-break: anywhere;
}
</style>
