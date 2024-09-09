<script>
import { onMount } from "svelte";
import Discord from "../icons/Discord.svelte";
import Github from "../icons/Github.svelte";
import Mastodon from "../icons/Mastodon.svelte";
import Patreon from "../icons/Patreon.svelte";
import Reddit from "../icons/Reddit.svelte";
import Twitter from "../icons/Twitter.svelte";
import { formatDataVolumeBits } from "../util/Formatting.svelte";

let server_tx = 0
let cache_tx = 0
let storage_tx = 0
onMount(async () => {
	try {
		const resp = await fetch(window.api_endpoint+"/misc/cluster_speed")
		if (resp.status >= 400) {
			throw Error(await resp.text())
		}
		const speed = await resp.json()
		server_tx = speed.server_tx
		cache_tx = speed.cache_tx
		storage_tx = speed.storage_tx
	} catch (err) {
		console.error("Failed to get speed stats", err)
	}
})
</script>

<footer>
	<div class="footer_content">
		<div style="display: inline-block; margin: 0 8px;">
			Pixeldrain is a product by
			<a href="//fornaxian.tech" target="_blank" rel="noreferrer">Fornaxian Technologies</a>
		</div>
		<br/>
		<div style="display: inline-block; margin: 0 8px;">
			<a href="https://www.patreon.com/pixeldrain" target="_blank" rel="noreferrer">
				<Patreon style="color: var(--body_text_color);"/> Patreon
			</a> |
			<a href="https://discord.gg/TWKGvYAFvX" target="_blank" rel="noreferrer">
				<Discord style="color: var(--body_text_color);"/> Discord
			</a> |
			<a href="https://twitter.com/Fornax96" target="_blank" rel="noreferrer">
				<Twitter style="color: var(--body_text_color);"/> Twitter
			</a> |
			<a href="https://reddit.com/r/pixeldrain" target="_blank" rel="noreferrer">
				<Reddit style="color: var(--body_text_color);"/> Reddit
			</a> |
			<a href="https://github.com/Fornaxian" target="_blank" rel="noreferrer">
				<Github style="color: var(--body_text_color);"/> GitHub
			</a> |
			<a href="https://mastodon.social/web/@fornax" target="_blank" rel="noreferrer">
				<Mastodon style="color: var(--body_text_color);"/> Mastodon
			</a>
		</div>
		<br/>
		<div style="display: inline-block; margin: 0 8px;">
			Server speed: {formatDataVolumeBits(server_tx, 4)}ps |
			Cache cluster: {formatDataVolumeBits(cache_tx, 4)}ps |
			Storage cluster: {formatDataVolumeBits(storage_tx, 4)}ps
		</div>
		<br/>
		<span class="small_footer_text" style="font-size: .75em; line-height: .75em;">
			page rendered by {window.server_hostname}
		</span>
	</div>
</footer>
