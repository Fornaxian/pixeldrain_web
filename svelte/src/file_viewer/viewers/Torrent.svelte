<script>
import { createEventDispatcher } from "svelte";
import Magnet from "../../icons/Magnet.svelte";
import { formatDate } from "../../util/Formatting.svelte"
import { copy_text } from "../../util/Util.svelte";
import TextBlock from "./TextBlock.svelte";
import TorrentItem from "./TorrentItem.svelte"

let dispatch = createEventDispatcher()

let status = "loading"
export const set_file = async f => {
	file = f

	dispatch("loading", true)

	try {
		let resp = await fetch(f.info_href+"/torrent")

		if (resp.status >= 400) {
			let json = await resp.json()

			if (json.value === "torrent_too_large") {
				status = "too_large"
				return
			} else {
				status = "parse_failed"
				return
			}
		}

		torrent = await resp.json()

		// Generate magnet link
		magnet = "magnet:?xt=urn:btih:" + torrent.info_hash +
			"&dn=" + encodeURIComponent(Object.keys(torrent.files.children)[0])

		torrent.trackers.forEach(tracker => {
			magnet += "&tr="+encodeURIComponent(tracker)
		})
	} catch (err) {
		console.error(err)
	} finally {
		dispatch("loading", false)
	}

	status = "finished"
}
let file = {
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	icon_href: "",
	show_ads: false,
}
let torrent = {
	trackers: [],
	comment: "",
	created_by: "",
	created_at: "",
	info_hash: "",
	files: null,
}

let magnet = ""

let copy_magnet_status = "" // empty, copied, or error
const copy_magnet = () => {
	if (copy_text(magnet)) {
		copy_magnet_status = "copied"
	} else {
		copy_magnet_status = "error"
		alert("Your browser does not support copying text.")
	}

	setTimeout(() => { copy_magnet_status = "" }, 60000)
}
</script>

<h1>{file.name}</h1>
<img src={file.icon_href} alt="File icon" class="icon">
<TextBlock width="650px">
	{#if status === "finished"}
		Created by: {torrent.created_by}<br/>
		Comment: {torrent.comment}<br/>
		Created at: {formatDate(new Date(torrent.created_at), true, true, true)}<br/>
		Info hash: {torrent.info_hash}<br/>
		<a href={magnet} class="button button_highlight">
			<Magnet></Magnet>
			<span>Open magnet link</span>
		</a>
		<button
			on:click={copy_magnet}
			class:button_highlight={copy_magnet_status === "copied"}
			class:button_red={copy_magnet_status === "error"}
		>
			<Magnet></Magnet>
			<span>
				{#if copy_magnet_status === ""}
					Copy magnet link
				{:else if copy_magnet_status === "copied"}
					Copied magnet
				{:else if copy_magnet_status === "error"}
					Error!
				{/if}
			</span>
		</button>
	{:else if status === "too_large"}
		<p>
			Torrent file is too large to parse. Please download the file and
			add it to your torrent client locally.
		</p>
	{:else if status === "parse_failed"}
		<p>
			Torrent file could not be parsed. It may be corrupted.
		</p>
	{/if}
	<button on:click={() => {dispatch("download")}} class="button">
		<i class="icon">download</i>
		<span>Download torrent file</span>
	</button>
</TextBlock>

{#if status === "finished"}
	<br/>
	<br/>
	<TextBlock width="1000px">
		<h2>Files in this torrent</h2>
		<TorrentItem item={torrent.files} />
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
