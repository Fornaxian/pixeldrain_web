<script lang="ts" module>
export type ZipEntry = {
	size: number,
	children?: {[index: string]: ZipEntry},
	properties?: string[],
	download_url?: string, // Added by us
	details_open?: boolean, // Added by us
};
</script>
<script lang="ts">
import { formatDataVolume, formatDate } from "util/Formatting"
import ZipItem from "file_viewer/viewers/ZipItem.svelte";
import IconBlock from "layout/IconBlock.svelte";
import TextBlock from "layout/TextBlock.svelte"
import { fs_node_icon, fs_path_url } from "filesystem/FilesystemAPI";
import type { FSNavigator } from "filesystem/FSNavigator";


let { nav, on_download, children }: {
	nav: FSNavigator;
	on_download: () => void;
	children?: import('svelte').Snippet;
} = $props();

let status = $state("loading")

let zip: ZipEntry = $state({size: 0} as ZipEntry)
let uncomp_size = 0
let comp_ratio = $state(0)
let archive_type = $state("")
let truncated = $state(false)

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

		const z = await resp.json() as ZipEntry

		// Check if the zip has the property which allows separate files to be
		// downloaded. If so then we set the download URL for each file. This
		// happens before the zip becomes state, else every file in the archive
		// would get a state proxy instead of only the ones which are rendered
		if (z.properties !== undefined) {
			if (z.properties.includes("read_individual_files")) {
				// Set the download URL for each file in the zip
				recursive_set_url(fs_path_url(nav.base.path)+"?zip_file=", z)
			}
			truncated = z.properties.includes("truncated")
		}

		uncomp_size = recursive_size(z)
		zip = z
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

{@render children?.()}

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
	<button class="button_highlight" onclick={on_download}>
		<i class="icon i_download"></i>
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
