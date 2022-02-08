<script>
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte"

export let file = {
	id: "",
	views: 0,
	size: 0,
	downloads: 0,
	bandwidth_used: 0,
}

let views = 0
let downloads = 0
let size = 0
let socket = null
let error_msg = ""

$: update_stats(file.id)
let update_stats = async id => {
	if (id === "" || id == "demo") {
		return
	}

	views = file.views
	if (file.size === 0) {
		downloads = file.downloads
	} else {
		downloads = Math.round((file.bandwidth_used + file.bandwidth_used_paid) / file.size)
	}
	size = file.size

	// If the socket is already active we need to close it
	if (socket !== null) {
		// Disable the error handler so it doesn't start retrying the connection
		socket.onerror = null
		socket.close()
		socket = null
	}

	console.log("opening socket for", id)
	socket = new WebSocket(
		location.origin.replace(/^http/, 'ws') + "/api/file/" + id + "/stats"
	)
	socket.onmessage = msg => {
		let j = JSON.parse(msg.data)
		console.debug("WS update", j)

		error_msg = ""
		views = j.views
		if (file.size === 0) {
			downloads = j.downloads
		} else {
			downloads = Math.round((j.bandwidth + j.bandwidth_paid) / file.size)
		}
	}
	socket.onerror = err => {
		if (socket === null) {
			return
		}
		console.error("WS error", err)
		socket.close()
		socket = null
		error_msg = "failed to get stats, retrying..."

		window.setTimeout(() => {
			if (socket === null) {
				update_stats(file.id)
			}
		}, 3000)
	}
}

</script>

<div>
	{#if error_msg !== ""}
		{error_msg}
	{:else}
		<div class="label">Views</div>
		<div class="stat">{formatThousands(views)}</div>
		<div class="label">Downloads</div>
		<div class="stat">{formatThousands(downloads)}</div>
		<div class="label">Size</div>
		<div class="stat">{formatDataVolume(size, 3)}</div>
	{/if}
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
