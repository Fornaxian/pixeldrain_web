<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume } from "util/Formatting";
import { stats } from "lib/StatsSocket"
import IconBlock from "layout/IconBlock.svelte";
import TextBlock from "layout/TextBlock.svelte"
let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	name: "",
	mime_type: "",
	availability: "",
}
</script>

<TextBlock>
	{#if file.availability === "file_rate_limited_captcha_required"}
		<h1>
			<i class="icon">file_download_off</i>
			Hotlink protection enabled
		</h1>
		<p>
			Hotlinking protection has been enabled for this file. This happens
			when a file is downloaded many times outside of our file viewer page
			(this page). You can find more information about hotlink protection
			on the <a href="/about#toc_6">FAQ page</a>.
		</p>
	{:else if file.availability === "ip_download_limited_captcha_required"}
		<h1>
			<i class="icon">file_download_off</i>
			Download limit reached
		</h1>
		<p>
			You have reached your download limit for today. Without a pixeldrain
			account you are limited to downloading {$stats.limits.download_limit} files
			or {formatDataVolume($stats.limits.transfer_limit, 3)} per 48 hours. This limit
			is counted per IP address, so if you're on a shared network it's
			possible that others have also contributed to this limit.
		</p>
		<p>
			In the last 24 hours you have downloaded
			{$stats.limits.download_limit_used} files and used
			{formatDataVolume($stats.limits.transfer_limit_used, 3)} bandwidth.
		</p>
	{/if}
	<p>
		This warning disappears when you have a
		<a href="/#pro" target="_blank">
			premium account
		</a>
		or when the uploader of the file enables
		<a href="/user/subscription">hotlinking</a> on their Pro account (and
		their data cap has not been used up). Using a download manager with a
		Pro account is allowed, it will not trigger this warning for other
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
</TextBlock>

<IconBlock icon_href={file.icon_href}>
	Name: {file.name}<br/>
	Type: {file.mime_type}<br/>
	<button on:click={() => {dispatch("download")}}>
		<i class="icon">download</i> Download
	</button>
	<a href="/#pro" target="_blank" class="button button_highlight">
		<i class="icon">bolt</i> Upgrade your account
	</a>
</IconBlock>
