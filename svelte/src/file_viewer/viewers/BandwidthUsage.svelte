<script>
import { onMount } from "svelte";
import { formatDataVolume } from "../../util/Formatting.svelte";
import TextBlock from "./TextBlock.svelte";
import ProgressBar from "../../util/ProgressBar.svelte";

export let file = {
	download_speed_limit: 0,
}
let limits = {
	download_limit: 0,
	download_limit_used: 0,
	transfer_limit: 0,
	transfer_limit_used: 0,
}
const update = async () => {
	try {
		let resp = await fetch(window.api_endpoint+"/misc/rate_limits")
		if(resp.status >= 400) {
			throw new Error(await resp.text())
		}
		limits = await resp.json()
	} catch (err) {
		console.error("Failed to get rate limits: "+err)
	}
}

onMount(async () => {
	update()
	let interval = setInterval(update, 30e3)
	return () => clearInterval(interval)
})
</script>

{#if limits.transfer_limit_used > 0}
	<TextBlock width="800px" center={true}>
		<p>
			You have used {formatDataVolume(limits.transfer_limit_used, 3)} of
			your daily {formatDataVolume(limits.transfer_limit, 3)} transfer
			limit. Your download speed is currently limited to
			{file.download_speed_limit/(1<<20)} MiB/s. When the transfer limit
			is exceeded your download speed will be reduced.
		</p>
		<p>
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12">
				Support Pixeldrain on Patreon
			</a>
			to disable the transfer and speed limits
		</p>

		<ProgressBar total={limits.transfer_limit} used={limits.transfer_limit_used}></ProgressBar>
	</TextBlock>
{/if}
