<script>
import { formatDuration } from "../../util/Formatting.svelte";

export let file = {
	id: "",
	name: "",
	show_ads: false,
	size: 0,
}
</script>

{#if file.show_ads && file.size > 1e8}
	<!-- If the file is larger than 100 MB we show a warning about the transfer speed -->
	<div class="description">
		<hr/>
		Your download speed is currently limited to 4 MiB/s. Downloading this
		file for free will take at least
		{formatDuration((file.size/4194304)*1000)} (under ideal conditions).
		You can
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12">
			upgrade to Pro
		</a>
		to download at the fastest speed available.
	</div>
{/if}

<style>
.description {
	display: inline-block;
	text-align: center;
	padding-left: 8px;
	vertical-align: middle;
	max-width: 700px;
}
</style>
