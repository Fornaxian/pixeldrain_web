<script>
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte"

export let list = {
	files: [],
}

$: size = list.files.reduce((acc, file) => acc += file.size, 0)
$: views = list.files.reduce((acc, file) => acc += file.views, 0)
$: downloads = list.files.reduce(
	(acc, file) => {
		if (file.size === 0) {
			acc += file.downloads
		} else {
			acc += Math.round((file.bandwidth_used + file.bandwidth_used_paid) / file.size)
		}
		return acc
	},
	0,
)

</script>

<div>
	<div class="label">Files</div>
	<div class="stat">{list.files.length}</div>
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
