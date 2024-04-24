<script>
import { onMount } from "svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte"

export let file = {
	id: "",
	views: 0,
	size: 0,
	downloads: 0,
	bandwidth_used: 0,
	bandwidth_used_paid: 0,
}
export let view_token = ""

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

	send_watch_command()
}

const send_watch_command = () => {
	if (socket.readyState === WebSocket.OPEN) {
		socket.send(
			JSON.stringify(
				{cmd: "watch_file", a1: file.id, a2: view_token}
			)
		)
	}
}

const init_socket = () => {
	if (socket !== null || socket.readyState !== WebSocket.CLOSED) {
		return
	}

	console.log("initializing socket")
	socket = new WebSocket(location.origin.replace(/^http/, 'ws') + "/api/file_stats")

	socket.onopen = () => send_watch_command()
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

		window.setTimeout(init_socket, 2000)
	}
}

onMount(() => {
	init_socket()

	return () => {
		if (socket !== null) {
			socket.close()
			socket = null
		}
	}
})
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
