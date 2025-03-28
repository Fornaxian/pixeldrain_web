<script>
import { formatDataVolume } from "util/Formatting"
import ProgressBar from "util/ProgressBar.svelte";

export let total = 0
export let used = 0
export let disable_warnings = false
$: frac = used / total
</script>

<ProgressBar total={total} used={used}></ProgressBar>
<div class="gauge_labels">
	<div>
		{formatDataVolume(used, 3)}
	</div>
	<div>
		{#if total <= 0}
			No limit
		{:else}
			{formatDataVolume(total, 3)}
		{/if}
	</div>
</div>

{#if !disable_warnings}
	{#if frac > 2.0}
		<div class="highlight_red">
			<span class="warn_text">
				You are using more than 200% of your allowed storage space!
			</span>
			<p>
				We have started deleting your files to free up space. If you do not
				want to lose any more files please upgrade to a subscription which
				supports the volume of storage which you need.
			</p>
			<a class="button button_highlight" href="/#pro">
				<i class="icon">bolt</i> Upgrade options
			</a>
		</div>
	{:else if frac > 1.0}
		<div class="highlight_red">
			<p>
				You have used all of your storage space. You won't be able to
				upload new files anymore. Please upgrade to a higher support
				tier to continue uploading files.
			</p>
			<a class="button button_highlight" href="/#pro">
				<i class="icon">bolt</i> Upgrade options
			</a>
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
				tier to continue uploading files.
			</p>
			<a class="button button_highlight" href="/#pro">
				<i class="icon">bolt</i> Upgrade options
			</a>
		</div>
	{/if}
{/if}

<style>
.warn_text {
	font-weight: bold;
	font-size: 1.5em;
}

.gauge_labels {
	display: flex;
	justify-content: space-between;
	line-height: 1em;
}
.gauge_labels > div {
	flex: 0 0 auto;
}
</style>
