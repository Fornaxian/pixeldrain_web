<script>
import { formatDataVolume } from "../util/Formatting.svelte"

export let total = 0
export let used = 0

$: frac = used / total
</script>

<div>
	Storage:
	{formatDataVolume(used, 3)}
	out of
	{formatDataVolume(total, 3)}
	<br/>
	<div class="progress_bar_outer">
		<div class="progress_bar_inner" style="width: {frac*100}%;"></div>
	</div>

	{#if frac > 2.0}
		<div class="highlight_red">
			<span class="warn_text">You are using more than 200% of your allowed storage space!</span>
			<p>
				We have started deleting your files to free up space. If you do
				not want to lose any more files please upgrade to a storage plan
				which supports the volume of storage which you need:
				<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
					Upgrade options
				</a>
			</p>
		</div>
	{:else if frac > 0.99}
		<div class="highlight_red">
			<p>
				You have used all of your storage space. You won't be able to
				upload new files anymore. Please upgrade to a higher support
				tier to continue uploading files:
				<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
					Upgrade options
				</a>
			</p>
			<p>
				Your files will not be deleted any sooner than normal at this
				moment. When your storage usage is over 200% we will start
				deleting your files to free up the space.
			</p>
		</div>
	{:else if frac > 0.8}
		<div class="highlight_yellow">
			<p>
				You have used {(frac*100).toFixed(0)}% of your
				storage space. If your storage space runs out you won't be able
				to upload new files anymore. Please upgrade to a higher support
				tier to continue uploading files:
				<a class="button button_highlight" href="https://www.patreon.com/join/pixeldrain">
					Upgrade options
				</a>
			</p>
		</div>
	{/if}
</div>

<style>
.warn_text {
	font-weight: bold;
	font-size: 1.5em;
}
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
