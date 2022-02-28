<script>
import { formatDuration } from "../../util/Formatting.svelte";
import TextBlock from "./TextBlock.svelte";

export let file = {
	id: "",
	name: "",
	show_ads: false,
	size: 0,
}
</script>

{#if file.show_ads && file.size > 1e8}
	<!-- If the file is larger than 100 MB we show a warning about the transfer speed -->
	<TextBlock width="650px" center={true}>
		Your download speed is currently limited to 2 MiB/s. Downloading this
		file for free will take at least
		{formatDuration((file.size/2097152)*1000)} (under ideal conditions).
		You can
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12">
			upgrade to Pro
		</a>
		to download at the fastest speed available.
	</TextBlock>
{/if}
