<script>
import { formatDataVolume } from "../util/Formatting.svelte"

export let total = 0
export let used = 0

$: frac = used / total
</script>

<div>
	Hotlink bandwidth:
	{formatDataVolume(used, 3)}
	out of
	{formatDataVolume(total, 3)}
	(<a href="/#hotlinking">More information about hotlinking</a>)
	<br/>
	<div class="progress_bar_outer">
		<div class="progress_bar_inner" style="width: {frac*100}%;"></div>
	</div>

	{#if frac > 0.99}
		<div class="highlight_red">
			You have used all of your hotlink bandwidth. Other people won't
			be able to download your files directly from the API anymore.
			Downloads will have to go through the file viewer page. Please
			upgrade to a higher support tier to continue hotlinking files:
			<br/>
			<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
				Upgrade options
			</a>
		</div>
	{:else if frac > 0.8}
		<div class="highlight_yellow">
			You have used {(frac*100).toFixed(0)}% of your
			hotlink bandwidth. If your hotlink bandwidth runs out people
			won't be able to download your files directly from the API
			anymore. Downloads will have to go through the file viewer page.
			Please upgrade to a higher support tier to continue hotlinking
			files:
			<br/>
			<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
				Upgrade options
			</a>
		</div>
	{/if}
</div>

<style>
.progress_bar_outer {
	display: block;
	background-color: var(--layer_1_color);
	width: 100%;
	height: 3px;
	margin: 6px 0 12px 0;
}
.progress_bar_inner {
	background-color: var(--highlight_color);
	height: 100%;
	width: 0;
	transition: width 1s;
}
</style>
