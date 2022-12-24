<script>
import { createEventDispatcher, onMount } from "svelte";
import { formatDataVolume, formatDuration } from "../../util/Formatting.svelte";
import { download_limits } from "../DownloadLimitStore";
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

<br/>
<TextBlock width="800px">
	<img src="/res/img/slow_down.webp" class="header_image" alt="Yea, I'm gonna need you to slow down a bit"/>
	<p>
		Pixeldrain's free tier is supported by advertisements. There's only so
		much that you can do with the budget those ads provide (spoiler: it's
		not a lot). {formatDataVolume($download_limits.transfer_limit, 3)} per week is
		about the most I can give away for free, and according to our records
		you have already downloaded
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
<br/>
<br/>

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
