<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte"
import IconBlock from "./IconBlock.svelte";
import TextBlock from "./TextBlock.svelte";
import ZipItem from "./ZipItem.svelte";

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
	size: 0,
	children: null,
}
let uncomp_size = 0
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

		uncomp_size = recursive_size(zip)
		comp_ratio = (uncomp_size / file.size)
	} catch (err) {
		console.error(err)
	} finally {
		dispatch("loading", false)
	}

	status = "finished"
}

const recursive_size = (file) => {
	let size = file.size

	// If the file has children (array is iterable) we call this function on all
	// the children and add the size to our size accumulator
	if (file.children.forEach) {
		file.children.forEach(child => {
			size += recursive_size(child)
		});
	}

	// Return the total size of this file and all its children
	return size
}
</script>

<h1>{file.name}</h1>

<IconBlock icon_href={file.icon_href}>
	Compressed size: {formatDataVolume(file.size, 3)}<br/>
	Uncompressed size: {formatDataVolume(uncomp_size, 3)} (Ratio: {comp_ratio.toFixed(2)}x)<br/>
	Uploaded on: {formatDate(file.date_upload, true, true, true)}
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</IconBlock>

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

<style>
h1 {
	text-shadow: 1px 1px 3px var(--shadow_color);
	line-break: anywhere;
}
</style>
