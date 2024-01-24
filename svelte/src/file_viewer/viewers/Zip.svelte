<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte"
import IconBlock from "./IconBlock.svelte";
import TextBlock from "./TextBlock.svelte";
import ZipItem from "./ZipItem.svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import FileTitle from "./FileTitle.svelte";

let dispatch = createEventDispatcher()

let status = "loading"

let file = {
	name: "",
	mime_type: "",
	size: 0,
	date_upload: "",
	icon_href: ""
}
let zip = {
	download_url: "",
	size: 0,
	children: null,
}
let comp_ratio = 0

export const set_file = async f => {
	file = f

	dispatch("loading", true)

	try {
		let resp = await fetch(f.info_href+"/zip")

		if (resp.status >= 400) {
			status = "parse_failed"
			return
		}

		zip = await resp.json()

		// Set the download URL for each file in the zip
		recursive_set_url(f.info_href+"/zip", zip)

		comp_ratio = (zip.size / file.size)
	} catch (err) {
		console.error(err)
	} finally {
		dispatch("loading", false)
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
	Compressed size: {formatDataVolume(file.size, 3)}<br/>
	Uncompressed size: {formatDataVolume(zip.size, 3)} (Ratio: {comp_ratio.toFixed(2)}x)<br/>
	Uploaded on: {formatDate(file.date_upload, true, true, true)}
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

{#if file.show_ads}
	<BandwidthUsage file={file} on:reload/>
{/if}

{#if status === "finished"}
	<TextBlock>
		<h2>Files in this zip archive</h2>
		<ZipItem item={zip} />
	</TextBlock>
{:else if status === "parse_failed"}
	<TextBlock>
		<p>
			Zip archive could not be parsed. It may be corrupted.
		</p>
	</TextBlock>
{/if}
