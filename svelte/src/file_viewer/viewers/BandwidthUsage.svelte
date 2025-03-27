<script>
import { formatDataVolume } from "../../util/Formatting.svelte";
import TextBlock from "../../layout/TextBlock.svelte"
import ProgressBar from "../../util/ProgressBar.svelte";
import { stats } from "../../lib/StatsSocket.mjs"

export let file = {
	size: 0,
}

$: transfer_left = $stats.limits.transfer_limit - $stats.limits.transfer_limit_used
</script>

{#if $stats.limits_init}
	<TextBlock center={true}>
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
			You have used {formatDataVolume($stats.limits.transfer_limit_used, 3)} of
			your daily {formatDataVolume($stats.limits.transfer_limit, 3)} transfer
			limit. When the transfer limit is exceeded your download speed will
			be reduced.
		</p>

		<p>
			<strong>
				<a href="/#pro" target="_blank" class="button button_highlight" rel="noreferrer">
					<i class="icon">bolt</i> Upgrade your account
				</a>
				to disable the transfer limit
			</strong>
		</p>

		<ProgressBar total={$stats.limits.transfer_limit} used={$stats.limits.transfer_limit_used}></ProgressBar>
	</TextBlock>
{/if}
