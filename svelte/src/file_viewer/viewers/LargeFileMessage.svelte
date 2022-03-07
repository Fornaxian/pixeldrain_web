<script>
import { formatDuration } from "../../util/Formatting.svelte";
import TextBlock from "./TextBlock.svelte";
export let file = {
	id: "",
	name: "",
	show_ads: false,
	size: 0,
	download_speed_limit: 0,
}
</script>

{#if file.show_ads && file.size > 1e8 && file.download_speed_limit > 0}
	<!-- If the file is larger than 100 MB we show a warning about the transfer speed -->
	<TextBlock width="700px" center={true}>

		Your download speed is currently limited to
		{file.download_speed_limit/(1<<20)} MiB/s. Though your download might be
		slower if the servers are overloaded. Downloading this file for free
		will take at least
		{formatDuration((file.size/file.download_speed_limit)*1000)} (under
		ideal conditions). You can
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12">
			support Pixeldrain on Patreon
		</a>
		to download at the highest speed available.

	</TextBlock>
{/if}
