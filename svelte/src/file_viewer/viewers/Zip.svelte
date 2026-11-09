<script lang="ts">
import { formatDataVolume, formatDate } from "util/Formatting"
import IconBlock from "layout/IconBlock.svelte";
import TextBlock from "layout/TextBlock.svelte"
import ZipItem from "./ZipItem.svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import FileTitle from "layout/FileTitle.svelte";

let { on_loading, on_download }: {
	on_loading: (loading: boolean) => void;
	on_download: () => void;
} = $props();

let status = $state("loading")

let file = $state({
	name: "",
	mime_type: "",
	size: 0,
	date_upload: "",
	icon_href: "",
	show_ads: false,
})
let zip = $state({
	download_url: "",
	size: 0,
	children: null,
})
let comp_ratio = $state(0)
let archive_type = $state("")
let truncated = $state(false)

export const set_file = async f => {
	file = f

	on_loading(true)

	if (f.mime_type === "application/zip") {
		archive_type = "zip"
	} else if (f.mime_type === "application/x-7z-compressed") {
		archive_type = "7z"
	}

	try {
		let resp = await fetch(f.info_href+"/zip")

		if (resp.status >= 400) {
			status = "parse_failed"
			return
		}

		const z = await resp.json()

		// Check if the zip has the property which allows separate files to be
		// downloaded. If so then we set the download URL for each file. This
		// happens before the zip becomes state, else every file in the archive
		// would get a state proxy instead of only the ones which are rendered
		if (z.properties !== undefined) {
			if (z.properties.includes("read_individual_files")) {
				// Set the download URL for each file in the zip
				recursive_set_url(f.info_href+"/zip", z)
			}
			truncated = z.properties.includes("truncated")
		}
		zip = z

		comp_ratio = (zip.size / file.size)
	} catch (err) {
		console.error(err)
	} finally {
		on_loading(false)
	}

	status = "finished"
}

const recursive_set_url = (parent_path, file) => {
	file.download_url = parent_path

	if (file.children) {
		Object.entries(file.children).forEach(child => {
			recursive_set_url(file.download_url + "/" +child[0], child[1])
		});
	}
}
</script>

<FileTitle title={file.name}/>

<IconBlock icon_href={file.icon_href}>
	{#if archive_type === "7z"}
		This is a 7-zip archive. You will need
		<a href="https://www.7-zip.org/">7-zip</a> or compatible software to
		extract it<br/>
	{/if}

	Compressed size: {formatDataVolume(file.size, 3)}<br/>
	{#if !truncated}
		Uncompressed size: {formatDataVolume(zip.size, 3)} (Ratio: {comp_ratio.toFixed(2)}x)<br/>
	{/if}
	Uploaded on: {formatDate(file.date_upload, true, true, true)}
	<br/>
	<button class="button_highlight" onclick={on_download}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

{#if file.show_ads}
	<BandwidthUsage/>
{/if}

{#if status === "finished"}
	<TextBlock>
		<h2>Files in this archive</h2>
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
