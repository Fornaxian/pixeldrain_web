<script>
import { onMount } from "svelte";
import { formatDataVolume } from "../../util/Formatting.svelte";
import TextBlock from "./TextBlock.svelte";
import ProgressBar from "../../util/ProgressBar.svelte";

let loaded = false
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
		loaded = true
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

{#if loaded}
	<TextBlock width="700px" center={true}>
		<p>
			<strong>
				Until the end of April the transfer limit is raised from 5 GB to
				50 GB, enjoy!
			</strong>
		</p>
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
