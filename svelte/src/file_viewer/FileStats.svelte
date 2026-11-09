<script lang="ts">
import { formatDataVolume, formatThousands } from "util/Formatting"
import { set_file, stats } from "lib/StatsSocket"

let { file }: { file: any } = $props();

let views = $derived($stats.file_stats_init ? $stats.file_stats.views : file.views)
let downloads = $derived.by(() => {
	if ($stats.file_stats_init) {
		if (file.size === 0) {
			return $stats.file_stats.downloads
		}
		return Math.round(($stats.file_stats.bandwidth + $stats.file_stats.bandwidth_paid) / file.size)
	}

	if (file.size === 0) {
		return file.downloads
	}
	return Math.round((file.bandwidth_used + file.bandwidth_used_paid) / file.size)
})

$effect(() => {
	set_file(file.id)
})
</script>

<div>
	<div class="label">Views</div>
	<div class="stat">{formatThousands(views)}</div>
	<div class="label">Downloads</div>
	<div class="stat">{formatThousands(downloads)}</div>
	<div class="label">Size</div>
	<div class="stat">{formatDataVolume(file.size, 3)}</div>
</div>

<style>
.label {
	text-align: left;
	padding-left: 10px;
	font-size: 0.8em;
	line-height: 0.7em;
	margin-top: 0.5em;
}
.stat {
	text-align: center;
}
</style>
