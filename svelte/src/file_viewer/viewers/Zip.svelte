<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte"
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

<img src={file.icon_href} alt="File icon" class="icon">
<TextBlock width="600px">
	Compressed size: {formatDataVolume(file.size, 3)}<br/>
	Uncompressed size: {formatDataVolume(uncomp_size, 3)}<br/>
	Uploaded on: {formatDate(file.date_upload, true, true, true)}
	<br/>
	<button class="button_highlight" on:click={() => {dispatch("download")}}>
		<i class="icon">download</i>
		<span>Download</span>
	</button>
</TextBlock>
<br/><br/>

{#if status === "parse_failed"}
	<TextBlock width="650px">
		<p>
			Zip archive could not be parsed. It may be corrupted.
		</p>
	</TextBlock>
{/if}

{#if status === "finished"}
	<TextBlock width="1000px">
		<h2>Files in this zip archive</h2>
		<ZipItem item={zip} />
	</TextBlock>
{/if}

<style>
h1 {
	text-shadow: 1px 1px 3px var(--shadow_color);
	line-break: anywhere;
}
</style>
