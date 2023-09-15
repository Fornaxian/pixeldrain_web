<script>
import ProgressBar from "../util/ProgressBar.svelte";

export let total = 0
export let used = 0

$: frac = used / total
</script>

<ProgressBar total={total} used={used}></ProgressBar>

{#if frac > 1}
	<div class="highlight_yellow">
		<p>
			You have used all of your data cap. People can still download your
			files, but premium features are disabled. This means that the
			download page shows pixeldrain branding, people who download your
			files have a daily download limit and hotlinking is disabled.
		</p>

		{#if window.user.monthly_transfer_cap > 0}
			<p>
				You have a billshock limit configured. <a
				href="/user/sharing/bandwidth">increase or disable the limit</a> to
				continue sharing files.
			</p>
		{/if}

		<a class="button button_highlight" href="/#pro">
			<i class="icon">bolt</i> Upgrade options
		</a>
	</div>
{:else if frac > 0.8}
	<div class="highlight_blue">
		<p>
			You have used {(frac*100).toFixed(0)}% of your data cap. If your
			data runs out people won't be able to download your files directly
			from the API anymore, ads will be shown on the file viewer and
			transfer rates will be limited.
		</p>

		{#if window.user.monthly_transfer_cap > 0}
			<p>
				You have a billshock limit configured. <a
				href="/user/sharing/bandwidth">increase or disable the limit</a> to
				continue sharing files.
			</p>
		{/if}

		<a class="button button_highlight" href="/#pro">
			<i class="icon">bolt</i> Upgrade options
		</a>
	</div>
{/if}
