<script lang="ts">
import { formatDataVolume } from "util/Formatting";
import TextBlock from "layout/TextBlock.svelte"
import ProgressBar from "util/ProgressBar.svelte";
import { stats } from "lib/StatsSocket"
</script>

{#if $stats.limits_init}
	<TextBlock center={true}>
		<p>
			You have used
			{formatDataVolume($stats.limits.transfer_limit_used, 3)}
			of your daily
			{formatDataVolume($stats.limits.transfer_limit, 3)}
			transfer limit. When the transfer limit is exceeded the download
			speed for new downloads will be limited. Exceeding the limit no
			longer affects running downloads.
		</p>

		<p>
			<strong>
				<a href="/user/prepaid/deposit" target="_blank" class="button button_highlight" rel="noreferrer">
					<i class="icon">bolt</i> Upgrade your account
				</a>
				to disable the transfer limit
			</strong>
		</p>

		<ProgressBar total={$stats.limits.transfer_limit} used={$stats.limits.transfer_limit_used}></ProgressBar>
	</TextBlock>
{/if}
