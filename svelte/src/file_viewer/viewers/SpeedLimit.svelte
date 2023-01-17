<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume, formatDuration } from "../../util/Formatting.svelte";
import { download_limits } from "../DownloadLimitStore";
import IconBlock from "./IconBlock.svelte";
import TextBlock from "./TextBlock.svelte";
let dispatch = createEventDispatcher()

export let file = {
	name: "",
	mime_type: "",
	availability: "",
	size: 0,
	download_speed_limit: 0,
}
</script>

<TextBlock>
	<img src="/res/img/slow_down.webp" class="header_image" alt="Yea, I'm gonna need you to slow down a bit"/>
	<p>
		Pixeldrain's free tier is supported by my Patrons (be grateful). There's
		only so much that you can do with the budget they provide.
		{formatDataVolume($download_limits.transfer_limit, 3)} per week is about
		the most I can give away for free while keeping it fair for everyone,
		and according to our records you have already downloaded
		{formatDataVolume($download_limits.transfer_limit_used, 3)}.
	</p>
	<p>
		It's not that I want to withold this file from you, it's just that I
		don't want pixeldrain to fall into bankruptcy like so many of the
		websites that came before me. So if you really want this file you have a
		few options:
	</p>
	<ul>
		<li>
			Come back next week when your free transfer limit resets
		</li>
		<li>
			Download the file at a rate of {file.download_speed_limit/(1<<10)}
			kiB/s. This will take at least
			{formatDuration((file.size/file.download_speed_limit)*1000)}
		</li>
		<li>
			<a href="https://www.patreon.com/join/pixeldrain" target="_blank" class="button button_highlight" rel="noreferrer">
				<i class="icon">bolt</i> Support Pixeldrain on Patreon
			</a>
			and earn my eternal gratitude
			{#if !window.user_authenticated}
				(you will need a <a href="/register">pixeldrain account</a> to
				receive the benefits)
			{/if}
		</li>
	</ul>
</TextBlock>

<IconBlock icon_href={file.icon_href}>
	Name: {file.name}<br/>
	Type: {file.mime_type}<br/>
	<button on:click={() => {dispatch("download")}}>
		<i class="icon">download</i> Download
	</button>
</IconBlock>

<TextBlock>
	Also, I believe you have my stapler. Please give it back.
</TextBlock>

<style>
.header_image {
	width: 100%;
	border-radius: 8px;
}
</style>
