<script>
import { createEventDispatcher } from "svelte";
import Magnet from "../../icons/Magnet.svelte";
import { formatDate } from "../../util/Formatting.svelte"
import { copy_text } from "../../util/Util.svelte";
import IconBlock from "./IconBlock.svelte";
import TextBlock from "./TextBlock.svelte";
import TorrentItem from "./TorrentItem.svelte"
import FileTitle from "./FileTitle.svelte";

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

<FileTitle title={file.name}/>

<IconBlock icon_href={file.icon_href}>
	{#if status === "finished"}
		Created by: {torrent.created_by}<br/>
		Comment: {torrent.comment}<br/>
		Created at: {formatDate(new Date(torrent.created_at), true, true, true)}<br/>
		Info hash: {torrent.info_hash}<br/>
		<a href={magnet} class="button button_highlight">
			<Magnet/>
			<span>Open magnet link</span>
		</a>
		<button
			on:click={copy_magnet}
			class:button_highlight={copy_magnet_status === "copied"}
			class:button_red={copy_magnet_status === "error"}
		>
			<Magnet/>
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
</IconBlock>

<TextBlock>
	<details>
		<summary>How do I download this? (expand for more information)</summary>
		<p>
			This is a torrent file, which means you will need a torrent client to
			download it. Here are some good torrent clients for various platforms:
		</p>
		<ul>
			<li><a href="https://transmissionbt.com/download">Transmission</a> (Linux, Mac, Windows)</li>
			<li><a href="https://www.qbittorrent.org/download">qBittorrent</a> (Linux, Mac, Windows)</li>
			<li><a href="https://play.google.com/store/apps/details?id=org.proninyaroslav.libretorrent">LibreTorrent</a> (Android)</li>
		</ul>
		<p>
			After installing your torrent client you will be able to use the
			<a href={magnet}><Magnet/> Open magnet link</a>
			button to download the files in your torrent client.
		</p>
		<h3>What is a torrent?</h3>
		<p>
			<a href="https://wikipedia.org/wiki/BitTorrent">BitTorrent</a> is a
			peer-to-peer network for sharing files. This torrent file does not
			actually contain the files listed below, instead it contains
			instructions for your torrent client to download the files from
			other people who happen to be downloading the same files currently.
			This means that instead of connecting to a single server (like
			pixeldrain), you will be connecting to other people on the internet
			to download these files.
		</p>
		<p>
			Torrents are a highly efficient and free method of transferring
			files over the internet. Since the bandwidth is shared directly
			between users there is no need for expensive servers to host the
			files for you.
		</p>
		<h3>Is this safe?</h3>
		<p>
			Your torrent client will make sure that the files you receive from
			your peers are actually what they say it is. This makes it just as
			safe as any other form of downloading. Like always when downloading
			files you still need to be aware of what you are downloading. Don't
			just blindly trust any file anyone sends you.
		</p>
		<h3>Is it private?</h3>
		<p>
			When downloading a torrent file you will be part of the so-called
			'torrent swarm'. Anyone in the swarm can see each other's IP
			addresses. This is not a bad thing on its own, but there a few cases
			in which this can be abused.
		</p>
		<p>
			Anyone in the swarm will be able to see what you are downloading,
			even across different torrents. This is something to keep in mind
			when downloading torrents. If someone can link your IP address to
			your identity then there are ways to find out which files you have
			downloaded in the past (provided that your IP address has not
			changed since then).
		</p>
		<p>
			If you are downloading copyrighted material (which I do not condone)
			then rightsholders will be able to see your IP address. In most
			cases this is not a problem because your ISP will still protect your
			identity. But there are some countries (notably the USA) where your
			ISP will not respect your right to privacy and the rightsholder will
			be able to contact you. If this worries you then you should look
			into VPN services to protect your privacy, like <a
			href="https://mullvad.net">Mullvad</a>.
		</p>
	</details>
</TextBlock>

{#if status === "finished"}
	<TextBlock>
		<h2>Files in this torrent</h2>
		<TorrentItem item={torrent.files} />
	</TextBlock>
{/if}

<style>
summary {
	cursor: pointer;
	border-bottom: 1px solid var(--separator);
}
</style>
