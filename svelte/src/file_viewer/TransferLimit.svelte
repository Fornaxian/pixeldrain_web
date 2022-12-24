<script>
import { formatDataVolume } from "../util/Formatting.svelte";
import { download_limits } from "./DownloadLimitStore.js"

let percent = 0
let title = ""
$: {
	if ($download_limits.transfer_limit === 0) {
		percent = 0 // Avoid division by 0
	}else if ($download_limits.transfer_limit_used / $download_limits.transfer_limit > 1) {
		percent = 100
	} else {
		percent = ($download_limits.transfer_limit_used / $download_limits.transfer_limit) * 100
	}

	title = "Transfer limit used: " +
		formatDataVolume($download_limits.transfer_limit_used, 3) +
		" of " +
		formatDataVolume($download_limits.transfer_limit, 3);
}
</script>

{#if $download_limits.loaded}
	<div class="progress_bar_outer" title="{title}">
		<div class="progress_bar_inner" style="width: {percent}%;">
		</div>
	</div>
{/if}

<style>
.progress_bar_outer {
	display: block;
	width: 100%;
	height: 6px;
	overflow: hidden;
}
.progress_bar_inner {
	background: var(--highlight_background);
	height: 100%;
	width: 0;
	border-top-right-radius: 6px;
	border-bottom-right-radius: 6px;
	transition: width 5s linear;
}
</style>
