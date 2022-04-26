<script>
import { createEventDispatcher, onMount } from "svelte";
import { formatDataVolume } from "../../util/Formatting.svelte";
import TextBlock from "./TextBlock.svelte";
import ProgressBar from "../../util/ProgressBar.svelte";

let dispatch = createEventDispatcher()

export let file = {
	size: 0,
}

let loaded = false
let limits = {
	download_limit: 0,
	download_limit_used: 0,
	transfer_limit: 0,
	transfer_limit_used: 0,
}
let transfer_left = 0

const update = async () => {
	try {
		let resp = await fetch(window.api_endpoint+"/misc/rate_limits")
		if(resp.status >= 400) {
			throw new Error(await resp.text())
		}
		limits = await resp.json()
		transfer_left = limits.transfer_limit - limits.transfer_limit_used
		loaded = true

		if (limits.transfer_limit_used > limits.transfer_limit) {
			dispatch("reload")
		}
	} catch (err) {
		console.error("Failed to get rate limits: "+err)
	}
}

onMount(() => {
	update()
	let interval = setInterval(update, 30e3)
	return () => clearInterval(interval)
})
</script>

{#if loaded}
	<TextBlock width="700px" center={true}>
		{#if file.size > transfer_left}
			<div class="highlight_yellow">
				This file is too large to download completely with your current
				transfer limit. The first {formatDataVolume(transfer_left, 3)}
				will download at full speed, but the remaining
				{formatDataVolume(file.size - transfer_left, 3)} will take
				longer
			</div>
		{/if}

		<p>
			You have used {formatDataVolume(limits.transfer_limit_used, 3)} of
			your daily {formatDataVolume(limits.transfer_limit, 3)} transfer
			limit. When the transfer limit is exceeded your download speed will
			be reduced.
		</p>

		<p>
			<strong>
				<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12">
					<i class="icon">bolt</i> Support Pixeldrain on Patreon
				</a>
				to disable the transfer limit
			</strong>
		</p>

		<ProgressBar total={limits.transfer_limit} used={limits.transfer_limit_used}></ProgressBar>
	</TextBlock>
{/if}
