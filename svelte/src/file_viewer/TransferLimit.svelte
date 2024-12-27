<script>
import { formatDataVolume } from "../util/Formatting.svelte";
import { stats } from "../lib/StatsSocket.js"

let percent = 0
let title = ""
$: {
	if ($stats.limits.transfer_limit === 0) {
		percent = 0 // Avoid division by 0
	} else if ($stats.limits.transfer_limit_used / $stats.limits.transfer_limit > 1) {
		percent = 100
	} else {
		percent = ($stats.limits.transfer_limit_used / $stats.limits.transfer_limit) * 100
	}

	title = "Download limit used: " +
		formatDataVolume($stats.limits.transfer_limit_used, 3) +
		" of " +
		formatDataVolume($stats.limits.transfer_limit, 3);
}
</script>

<!-- Always show the outer bar to prevent layout shift -->
<div class="progress_bar_outer" title="{title}">
	{#if $stats.limits_init}
		<div class="progress_bar_text">
			{title}
		</div>
		<div class="progress_bar_inner" style="width: {percent}%;">
			{title}
		</div>
	{/if}
</div>

<style>
.progress_bar_outer {
	position: relative;
	display: block;
	width: 100%;
	/* the font-size is two pixels smaller than the progress bar, this leaves
	one px margin top and bottom */
	height: 18px;
	font-size: 15px;
	line-height: 18px;
	overflow: hidden;
}
.progress_bar_inner {
	position: absolute;
	display: block;
	background: var(--highlight_background);
	height: 100%;
	width: 0;
	transition: width 5s linear;

	/* Welcome to Hacktown! What's happening here is that the text in the
	progress bar and the text behind the progress bar are perfectly aligned. The
	text in the background is dark and the text on the foreground is light, this
	makes it look like the text changes colour as the progress bar progresses.
	The text-align: right makes the text move along with the tip of the progress
	bar once the width of the text has been exceeded. */
	text-align: right;
	overflow: hidden;
	white-space: nowrap;
	color: var(--highlight_text_color);
	padding-right: 4px;
	padding-left: 4px;
	z-index: 2;
}
.progress_bar_text {
	position: absolute;
	display: block;
	top: 0;
	left: 4px;
	z-index: 1;
}
</style>
