<script>
import { createEventDispatcher } from "svelte";
import { formatDataVolume, formatDuration } from "../util/Formatting.svelte";
import { stats } from "../lib/StatsSocket.js"
import TextBlock from "./TextBlock.svelte"
import IconBlock from "./IconBlock.svelte";
let dispatch = createEventDispatcher()

export let file_size = 0
export let file_name = ""
export let file_type = ""
export let icon_href = ""
</script>

<TextBlock>
	<img src="/res/img/slow_down.webp" class="header_image" alt="Yea, I'm gonna need you to slow down a bit"/>
	<p>
		Pixeldrain's free tier is supported by my Patrons. There's only so much
		that you can do with the budget they provide.
		{formatDataVolume($stats.limits.transfer_limit, 3)} per day is about the
		most I can give away for free while keeping it fair for everyone, and
		according to our records you have already downloaded
		{formatDataVolume($stats.limits.transfer_limit_used, 3)}.
	</p>
	<p>
		It's not that I want to withold this file from you, it's just that I
		don't want pixeldrain to fall into bankruptcy like so many of the
		websites that came before me. So if you really want this file you have a
		few options:
	</p>
	<ul>
		<li>
			Come back tomorrow when your free transfer limit resets
		</li>
		<li>
			Download the file at a limited rate of 1 MiB/s. This will take at
			least {formatDuration((file_size/(1<<20))*1000, 0)}
		</li>
		<li>
			<a href="/#pro" target="_blank" class="button button_highlight">
				<i class="icon">bolt</i> Upgrade your account
			</a>
			and earn my eternal gratitude
			{#if !window.user_authenticated}
				(you will need a <a href="/register">pixeldrain account</a> to
				receive the benefits)
			{/if}
		</li>
	</ul>
</TextBlock>

<IconBlock icon_href={icon_href}>
	<table>
		<tr><td colspan="2">{file_name}</td></tr>
		<tr><td>Type</td><td>{file_type}</td></tr>
		<tr><td>Size</td><td>{formatDataVolume(file_size, 3)}</td></tr>
	</table>
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
