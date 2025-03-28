import { readable } from "svelte/store";

type SocketResults = {
	connected: boolean,
	file_stats_init: boolean,
	file_stats: FileStats
	limits_init: boolean,
	limits: Limits,
}

type FileStats = {
	views: number,
	downloads: number,
	bandwidth: number,
	bandwidth_paid: number,
}

type Limits = {
	server_overload: boolean,
	speed_limit: number,
	download_limit: number,
	download_limit_used: number,
	transfer_limit: number,
	transfer_limit_used: number,
}

type SocketCommand = {
	type: string,
	data?: Object,
}

let results: SocketResults = {
	file_stats: {} as FileStats,
	limits: {} as Limits,
} as SocketResults

export const stats = readable(
	results,
	(set) => {
		start_sock(set)
		return () => stop_sock(set)
	},
);

let socket: WebSocket = null
const start_sock = (set_func: (value: SocketResults) => void) => {
	if (socket !== null) {
		return
	}

	console.log("Initializing stats socket")
	socket = new WebSocket(location.origin.replace(/^http/, 'ws') + "/api/file_stats")

	socket.onopen = () => {
		results.connected = true
		// set_func(results)

		// Subscribe to the rate limit feed. This will also process any queued
		// commands built up while the socket was down
		send_cmd({ type: "limits" })
	}
	socket.onmessage = (msg: MessageEvent) => {
		let j = JSON.parse(msg.data)
		console.debug("WS update", j)

		if (j.type === "file_stats") {
			results.file_stats = j.file_stats
			results.file_stats_init = true
			set_func(results)
		} else if (j.type === "limits") {
			results.limits = j.limits
			results.limits_init = true
			set_func(results)
		} else {
			console.error("Unknown ws message type", j.type, "data", msg.data)
		}
	}
	socket.onerror = (err: Event) => {
		console.error("Stats socket error", err)
		stop_sock(set_func)
		window.setTimeout(() => start_sock(set_func), 2000)
	}
	socket.onclose = (e: CloseEvent) => {
		console.debug("Stats socket close", e)
		stop_sock(set_func)
		window.setTimeout(() => start_sock(set_func), 2000)
	}
}

const stop_sock = (set_func: (value: SocketResults) => void) => {
	if (socket === null) {
		return
	}

	// Prevent error handlers from re-initializing the socket
	socket.onerror = null
	socket.onclose = null

	// Close and delete the socket
	socket.close()
	socket = null

	// Reset the state
	results.connected = false
	results.file_stats_init = false
	results.limits_init = false
	set_func(results)
}


export const set_file = (file_id: string) => {
	send_cmd({
		type: "file_stats",
		data: { file_id: file_id },
	})
}

let queued_commands = []
const send_cmd = (cmd: SocketCommand) => {
	if (socket !== null && socket.readyState === WebSocket.OPEN) {

		// First empty the queue
		while (queued_commands.length !== 0) {
			socket.send(JSON.stringify(queued_commands.shift()))
		}

		// Send the requested command
		socket.send(JSON.stringify(cmd))
	} else if (cmd !== null) {
		queued_commands.push(cmd)
		console.debug("Socket is closed, command", cmd, "added to queue")
	}
}
