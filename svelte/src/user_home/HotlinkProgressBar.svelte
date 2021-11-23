<script>
import { formatDataVolume } from "../util/Formatting.svelte"
import ProgressBar from "../util/ProgressBar.svelte";

export let total = 0
export let used = 0

$: frac = used / total
</script>

<div>
	<ProgressBar total={total} used={used}></ProgressBar>

	{#if frac > 0.99}
		<div class="highlight_red">
			You have used all of your data cap. People can still download your
			files, but not directly from the API anymore. The file viewer shows
			ads on your files and download speeds are limited.
			<br/>
			<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
				Upgrade options
			</a>
		</div>
	{:else if frac > 0.8}
		<div class="highlight_yellow">
			You have used {(frac*100).toFixed(0)}% of your data cap. If your
			data runs out people won't be able to download your files directly
			from the API anymore, ads will be shown on the file viewer and
			transfer rates will be limited.
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
