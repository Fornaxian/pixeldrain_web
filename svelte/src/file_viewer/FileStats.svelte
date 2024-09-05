<script>
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte"
import { set_file, stats } from "src/util/StatsSocket"

export let file = {
	id: "",
	views: 0,
	size: 0,
	downloads: 0,
	bandwidth_used: 0,
	bandwidth_used_paid: 0,
}

let views = 0
let downloads = 0
let size = 0
$: {
	size = file.size

	if ($stats.file_stats_init) {
		views = $stats.file_stats.views

		if (file.size === 0) {
			downloads = $stats.file_stats.downloads
		} else {
			downloads = Math.round(($stats.file_stats.bandwidth + $stats.file_stats.bandwidth_paid) / file.size)
		}
	} else {
		views = file.views

		if (file.size === 0) {
			downloads = file.downloads
		} else {
			downloads = Math.round((file.bandwidth_used + file.bandwidth_used_paid) / file.size)
		}
	}
}

$: set_file(file.id)
</script>

<div>
	<div class="label">Views</div>
	<div class="stat">{formatThousands(views)}</div>
	<div class="label">Downloads</div>
	<div class="stat">{formatThousands(downloads)}</div>
	<div class="label">Size</div>
	<div class="stat">{formatDataVolume(size, 3)}</div>
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
