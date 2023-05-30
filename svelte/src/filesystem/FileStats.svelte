<script>
import { onDestroy } from "svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte"
import { fs_path_url } from "./FilesystemUtil";

export let state

let downloads = 0
let transfer_used = 0
let socket = null
let error_msg = "Loading..."

let connected_to = ""

$: update_base(state.base)

const update_base = async base => {
	if (connected_to === base.path) {
		return
	}
	connected_to = base.path

	// If the socket is already active we need to close it
	close_socket()

	error_msg = "Loading..."

	let ws_endpoint = location.origin.replace(/^http/, 'ws') +
		fs_path_url(base.path).replace(/^http/, 'ws') +
		"?download_stats"

	console.log("Opening socket to", ws_endpoint)
	socket = new WebSocket(ws_endpoint)
	socket.onmessage = msg => {
		let j = JSON.parse(msg.data)
		console.debug("WS update", j)

		error_msg = ""
		downloads = j.downloads
		transfer_used = j.transfer_free + j.transfer_paid
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
				update_base(base)
			}
		}, 3000)
	}
}

const close_socket = () => {
	if (socket !== null) {
		// Disable the error handler so it doesn't start retrying the connection
		socket.onerror = null
		socket.close()
		socket = null
	}
}

onDestroy(close_socket)
</script>

<div>
	{#if error_msg !== ""}
		{error_msg}
	{:else}
		<div class="label">Downloads</div>
		<div class="stat">{formatThousands(downloads)}</div>
		<div class="label">Transfer used</div>
		<div class="stat">{formatDataVolume(transfer_used, 3)}</div>
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
