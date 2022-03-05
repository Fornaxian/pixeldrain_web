<script>
import { createEventDispatcher, onMount } from "svelte";
import { formatDataVolume, formatDuration } from "../../util/Formatting.svelte";
import TextBlock from "./TextBlock.svelte";
let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	name: "",
	mime_type: "",
	availability: "",
}

let limits = {
	download_limit: 1000,
	download_limit_used: 0,
	transfer_limit: 50e9,
	transfer_limit_used: 0,
}
onMount(async () => {
	try {
		let resp = await fetch(window.api_endpoint+"/misc/rate_limits")
		if(resp.status >= 400) {
			throw new Error(await resp.text())
		}
		limits = await resp.json()
	} catch (err) {
		alert("Failed to get rate limits: "+err)
	}
})
</script>

<br/>
<TextBlock width="800px">
	<img src="/res/img/slow_down.webp" class="header_image" alt="Yea, I'm gonna need you to slow down a bit"/>
	<p>
		Yea, so pixeldrain's free tier is supported by advertisements. And
		there's only so much that you can do with the budget those ads provide
		(spoiler: it's not a lot). {formatDataVolume(limits.transfer_limit, 3)}
		every 48 hours is about the most I can give away for free, according to
		our records you have already downloaded
		{formatDataVolume(limits.transfer_limit_used, 3)}.
	</p>
	<p>
		It's not that I want to withold this file from you, it's just that I
		don't want pixeldrain to fall into bankruptcy like so many of the
		websites that came before me. So if you really want these files you have
		a few options:
	</p>
	<ul>
		<li>Come back in 48 hours when your free transfer limit resets</li>
		<li>
			Download the file at a rate of {limits.speed_limit/(1<<20)} MiB/s.
			This will take at least {formatDuration((file.size/2097152)*1000)}
		</li>
		<li>
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12" target="_blank" class="button button_highlight">
				<i class="icon">bolt</i> Support Pixeldrain on Patreon
			</a>
			and earn my eternal gratitude
			{#if !window.user_authenticated}
				(you will need a <a href="/register">pixeldrain account</a> to
				receive the benefits)
			{/if}
		</li>
	</ul>
	<img src={file.icon_href} alt="File icon" class="file_thumbnail">
	<div class="file_description">
		Name: {file.name}<br/>
		Type: {file.mime_type}<br/>
		<button on:click={() => {dispatch("download")}}>
			<i class="icon">download</i> Download
		</button>
	</div>
	<p>
		Also, I believe you have my stapler. Please give it back.
	</p>
</TextBlock>

<style>
.header_image {
	width: 100%;
	border-radius: 8px;
}
.file_thumbnail {
	display: inline-block;
	vertical-align: middle;
	height: 6em;
	border-radius: 8px;
}
.file_description {
	display: inline-block;
	text-align: left;
	padding-left: 8px;
	vertical-align: middle;
	max-width: 600px;
}
</style>
