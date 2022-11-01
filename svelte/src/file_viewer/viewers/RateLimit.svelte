<script>
import { createEventDispatcher, onMount } from "svelte";
import { formatDataVolume } from "../../util/Formatting.svelte";
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
	{#if file.availability === "file_rate_limited_captcha_required"}
		<h1>
			<i class="icon">file_download_off</i>
			Hotlink protection enabled
		</h1>
		<p>
			Hotlinking protection has been enabled for this file. This happens when
			a file is downloaded many times outside of our file viewer page (this
			page). Usually this means people are using download managers like
			JDownloader 2, Aria2 or wget. Using a download manager circumvents
			pixeldrain's advertisements and we lose money because of that. More
			information about this protection mechanism can be found on <a
			href="/#hotlinking">the home page</a>.
		</p>
	{:else if file.availability === "ip_download_limited_captcha_required"}
		<h1>
			<i class="icon">file_download_off</i>
			Download limit reached
		</h1>
		<p>
			You have reached your download limit for today. Without a pixeldrain
			account you are limited to downloading {limits.download_limit} files
			or {formatDataVolume(limits.transfer_limit, 3)} per 48 hours. This limit
			is counted per IP address, so if you're on a shared network it's
			possible that others have also contributed to this limit.
		</p>
		<p>
			In the last 24 hours you have downloaded
			{limits.download_limit_used} files and used
			{formatDataVolume(limits.transfer_limit_used, 3)} bandwidth.
		</p>
	{/if}
	<p>
		This warning disappears when the you are a
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5736701&cadence=12" target="_blank">Patreon supporter</a>,
		or when the uploader of the file enables
		<a href="/user/subscription">bandwidth sharing</a> on their Pro account
		(and their data cap has not been used up). Using a download manager with
		a Pro account is allowed, it will not trigger this warning for other
		files.
	</p>
	<h2>
		Continue downloading
	</h2>
	<p>
		The file can be downloaded like usual by clicking the download button.
		You will have to complete a CAPTCHA test to prove that you're not a
		robot.
	</p>

	<img src={file.icon_href} alt="File icon" class="file_thumbnail">
	<div class="file_description">
		Name: {file.name}<br/>
		Type: {file.mime_type}<br/>
		<button on:click={() => {dispatch("download")}}>
			<i class="icon">download</i> Download
		</button>
		<a href="https://www.patreon.com/join/pixeldrain" target="_blank" class="button button_highlight">
			<i class="icon">bolt</i> Support Pixeldrain on Patreon
		</a>
	</div>
</TextBlock>

<style>
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
