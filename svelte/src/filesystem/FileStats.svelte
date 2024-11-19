<script>
import { onMount } from "svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte"
import { fs_path_url } from "./FilesystemAPI.mjs";

export let nav

let loading = true
let downloads = 0
let transfer_used = 0
let socket = null
let error_msg = ""

let connected_to = ""

onMount(() => {
	const unsub = nav.subscribe(update_base)
	return () => {
		unsub()
		close_socket()
	}
})

let total_directories = 0
let total_files = 0
let total_file_size = 0

const update_base = async () => {
	if (!nav.initialized) {
		return
	}

	// Update counters with new info
	total_directories = nav.children.reduce((acc, cur) => cur.type === "dir" ? acc + 1 : acc, 0)
	total_files = nav.children.reduce((acc, cur) => cur.type === "file" ? acc + 1 : acc, 0)
	total_file_size = nav.children.reduce((acc, cur) => acc + cur.file_size, 0)

	if (nav.base.type === "dir") {
		console.debug("Not opening websocket for directory")
		return
	} else if (connected_to === nav.base.path) {
		return // If we're already connected to the same path, don't reconnect
	}
	connected_to = nav.base.path

	// If the socket is already active we need to close it
	close_socket()

	loading = true

	let ws_endpoint = location.origin.replace(/^http/, 'ws') +
		fs_path_url(nav.base.path).replace(/^http/, 'ws') +
		"?download_stats"

	console.log("Opening socket to", ws_endpoint, "for path", nav.base.path)
	socket = new WebSocket(ws_endpoint)
	socket.onmessage = msg => {
		let j = JSON.parse(msg.data)
		console.debug("WS update", j)

		error_msg = ""
		loading = false
		downloads = j.downloads
		transfer_used = j.transfer_free + j.transfer_paid
	}
	socket.onerror = err => {
		console.error("WS error", err)
		error_msg = "failed to get stats, retrying..."

		close_socket()

		window.setTimeout(() => {
			if (socket === null) {
				update_base(nav.base)
			}
		}, 5000)
	}
}

const close_socket = () => {
	// Clear this path so the update_base function does not instantly return
	// with the next retry
	connected_to = ""

	if (socket !== null) {
		// Disable the error handler so it doesn't start retrying the connection
		socket.onerror = null
		socket.close()
		socket = null
	}
}
</script>

{#if $nav.base.type === "file"}
	{#if error_msg !== ""}
		{error_msg}
	{:else}
		<div class="group">
			<div class="label">Downloads</div>
			<div class="stat">
				{loading ? "Loading..." : formatThousands(downloads)}
			</div>

		</div>
		<div class="group">
			<div class="label">Transfer used</div>
			<div class="stat">
				{loading ? "Loading..." : formatDataVolume(transfer_used, 3)}
			</div>
		</div>
	{/if}

	<div class="group">
		<div class="label">Size</div>
		<div class="stat">{formatDataVolume($nav.base.file_size, 3)}</div>
	</div>

{:else if $nav.base.type === "dir" || $nav.base.type === "bucket"}

	<div class="group">
		<div class="label">Directories</div>
		<div class="stat">{formatThousands(total_directories, 3)}</div>
	</div>

	<div class="group">
		<div class="label">Files</div>
		<div class="stat">{formatThousands(total_files, 3)}</div>
	</div>

	<div class="group">
		<div class="label">Total size</div>
		<div class="stat">{formatDataVolume(total_file_size, 3)}</div>
	</div>
{/if}

<style>
.group {
	flex: 1 1 auto;
	text-align: center;
}
.label {
	padding-left: 0.5em;
	text-align: left;
	font-size: 0.8em;
	line-height: 1em;
}
.stat {
	line-height: 1.2em;
}
@media (max-width: 800px) {
	.label {
		text-align: center;
		padding-left: 0;
	}
}
</style>
