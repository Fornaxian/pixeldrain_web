<script lang="ts">
import { flip } from "svelte/animate";
import { formatDataVolume } from "util/Formatting";
import SortButton from "layout/SortButton.svelte";
import { admin_decommission_node } from "lib/AdminAPI";

type Peer = {
	id: string
	ip: string
	port: number
	hostname: string
	role: string
	reachable: boolean
	unreachable_count: number
	latency: number
	last_seen: string
	free_space: number
	min_free_space: number
	load_1_min: number
	load_5_min: number
	load_15_min: number
	avg_network_tx: number
	avg_network_rx: number
	port_speed: number
	cache_threshold: number

	// Our props
	avg_network_total?: number
	usage_percent?: number
	network_ratio?: number
}

export let peers: Peer[] = [];

$: all_reachable = peers.reduce((acc, val) => {
	return val.reachable ? acc : false
}, true)

$: update_peers(peers)
let update_peers = (peers: Peer[]) => {
	for (let peer of peers) {
		peer.avg_network_total = peer.avg_network_tx + peer.avg_network_rx
		peer.usage_percent = (peer.avg_network_tx / peer.port_speed) * 100
		peer.network_ratio = Math.max(peer.avg_network_tx, peer.avg_network_rx) / Math.min(peer.avg_network_tx, peer.avg_network_rx)
	}

	sort("")
}

// Expand an IPv6 address into eight zero-padded groups of four hex digits so
// that it sorts numerically when compared as a string. Handles the "::"
// shorthand and an optional embedded IPv4 address in the final 32 bits.
let expand_ipv6 = (addr: string) => {
	addr = addr.toLowerCase()

	// An embedded IPv4 address (e.g. "::ffff:192.0.2.1") fills the last two
	// groups. Convert it to hex before expanding the rest.
	let v4 = addr.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
	if (v4 !== null) {
		let g1 = ((parseInt(v4[1]) << 8) | parseInt(v4[2])).toString(16)
		let g2 = ((parseInt(v4[3]) << 8) | parseInt(v4[4])).toString(16)
		addr = addr.slice(0, v4.index) + g1 + ":" + g2
	}

	// "::" stands in for one or more all-zero groups. Split on it to learn how
	// many groups are missing from the middle.
	let halves = addr.split("::")
	let head = halves[0] === "" ? [] : halves[0].split(":")
	let tail = halves.length > 1 && halves[1] !== "" ? halves[1].split(":") : []
	let zeros = new Array(Math.max(0, 8 - head.length - tail.length)).fill("0")

	return head.concat(zeros, tail).map(g => g.padStart(4, "0")).join(":")
}

// Turn a hostname into a string that sorts correctly. IPv6 addresses (wrapped
// in brackets, "[::1]:1234") are expanded; everything else sorts as-is.
let sort_key = (hostname) => {
	let end = hostname.startsWith("[") ? hostname.indexOf("]") : -1
	if (end === -1) {
		return hostname.toLowerCase()
	}
	let addr = hostname.slice(1, end)
	let port = hostname.slice(end + 2) // skip the "]:"
	return expand_ipv6(addr) + ":" + port.padStart(5, "0")
}

let sort_field = "hostname"
let asc = true
let sort = (field) => {
	if (field !== "" && field === sort_field) {
		asc = !asc
	}
	if (field === "") {
		field = sort_field
	}
	sort_field = field

	console.log("sorting by", field, "asc", asc)
	peers.sort((a, b) => {
		let av = a[field]
		let bv = b[field]
		if (typeof av === "number") {
			// Sort ints from high to low
			return asc ? av - bv : bv - av
		}
		if (field === "hostname") {
			// Normalize so IPv6 addresses sort numerically
			av = sort_key(av)
			bv = sort_key(bv)
		}
		// Sort strings alphabetically
		return asc ? av.localeCompare(bv) : bv.localeCompare(av)
	})
	peers = peers
}

const decommission = async (id: string) => {
	try {
		await admin_decommission_node(id)
	} catch (err) {
		alert(JSON.stringify(err))
	}
}
</script>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td><SortButton field="hostname" active_field={sort_field} asc={asc} sort_func={sort}>Hostname</SortButton></td>
				<td><SortButton field="unreachable_count" active_field={sort_field} asc={asc} sort_func={sort}>Err</SortButton></td>
				<td><SortButton field="load_15_min" active_field={sort_field} asc={asc} sort_func={sort}>Load</SortButton></td>
				<td><SortButton field="latency" active_field={sort_field} asc={asc} sort_func={sort}>Ping</SortButton></td>
				<td><SortButton field="avg_network_tx" active_field={sort_field} asc={asc} sort_func={sort}>TX</SortButton></td>
				<td><SortButton field="avg_network_rx" active_field={sort_field} asc={asc} sort_func={sort}>RX</SortButton></td>
				<td><SortButton field="network_ratio" active_field={sort_field} asc={asc} sort_func={sort}>Rat</SortButton></td>
				<td><SortButton field="avg_network_total" active_field={sort_field} asc={asc} sort_func={sort}>Tot</SortButton></td>
				<td><SortButton field="usage_percent" active_field={sort_field} asc={asc} sort_func={sort}>Use%</SortButton></td>
				<td><SortButton field="cache_threshold" active_field={sort_field} asc={asc} sort_func={sort}>CThresh</SortButton></td>
				<td><SortButton field="free_space" active_field={sort_field} asc={asc} sort_func={sort}>Free</SortButton></td>
				<td><SortButton field="min_free_space" active_field={sort_field} asc={asc} sort_func={sort}>Min free</SortButton></td>
				{#if !all_reachable}<td></td>{/if}
			</tr>
		</thead>
		<tbody>
			{#each peers as peer (peer.id)}
				<tr style="border: none;"
					class:highlight_red={!peer.reachable}
					class:highlight_yellow={peer.free_space < peer.min_free_space / 2}
					class:highlight_blue={peer.free_space < peer.min_free_space}
					class:highlight_green={peer.reachable}
					animate:flip={{duration: 1000}}
				>
					<td>{peer.hostname}</td>
					<td>{peer.unreachable_count}</td>
					<td>{peer.load_1_min.toFixed(1)} / {peer.load_5_min.toFixed(1)} / {peer.load_15_min.toFixed(1)}</td>
					<td>{(peer.latency/1000).toFixed(3)}</td>
					<td>{formatDataVolume(peer.avg_network_tx, 3)}/s</td>
					<td>{formatDataVolume(peer.avg_network_rx, 3)}/s</td>
					<td>{peer.network_ratio.toFixed(2)}</td>
					<td>{formatDataVolume(peer.avg_network_total, 3)}/s</td>
					<td>{Math.round(peer.usage_percent)}%</td>
					<td>{formatDataVolume(peer.cache_threshold, 3)}</td>
					<td>{formatDataVolume(peer.free_space, 3)}</td>
					<td>{formatDataVolume(peer.min_free_space, 3)}</td>
					{#if !all_reachable}
						<td>
							<button class="button flat delete" on:click={() => decommission(peer.id)}>
								<i class="icon small">delete</i>
							</button>
						</td>
					{/if}
				</tr>
			{/each}

			<tr>
				<td>Total ({peers.length})</td>
				<td>{peers.reduce((acc, val) => acc += val.unreachable_count, 0)}</td>
				<td>
					{peers.reduce((acc, val) => acc += val.load_1_min, 0).toFixed(1)} /
					{peers.reduce((acc, val) => acc += val.load_5_min, 0).toFixed(1)} /
					{peers.reduce((acc, val) => acc += val.load_15_min, 0).toFixed(1)}
				</td>
				<td>{(peers.reduce((acc, val) => acc += val.latency, 0)/1000).toFixed(0)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_tx, 0), 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_rx, 0), 3)}/s</td>
				<td>{peers.reduce((acc, val) => acc += val.network_ratio, 0).toFixed(2)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_total, 0), 3)}/s</td>
				<td>{Math.round(peers.reduce((acc, val) => acc += val.usage_percent, 0))}%</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.cache_threshold, 0), 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.free_space, 0), 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.min_free_space, 0), 3)}</td>
				{#if !all_reachable}<td></td>{/if}
			</tr>
			<tr>
				<td>Average</td>
				<td></td>
				<td>
					{(peers.reduce((acc, val) => acc += val.load_1_min, 0) / peers.length).toFixed(1)} /
					{(peers.reduce((acc, val) => acc += val.load_5_min, 0) / peers.length).toFixed(1)} /
					{(peers.reduce((acc, val) => acc += val.load_15_min, 0) / peers.length).toFixed(1)}
				</td>
				<td>{(peers.reduce((acc, val) => acc += val.latency, 0) / 1000 / peers.length).toFixed(0)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_tx, 0) / peers.length, 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_rx, 0) / peers.length, 3)}/s</td>
				<td>{(peers.reduce((acc, val) => acc += val.network_ratio, 0) / peers.length).toFixed(2)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_total, 3) / peers.length, 4)}/s</td>
				<td>{Math.round(peers.reduce((acc, val) => acc += val.usage_percent, 0) / peers.length)}%</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.cache_threshold, 0) / peers.length, 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.free_space, 0) / peers.length, 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.min_free_space, 0) / peers.length, 3)}</td>
				{#if !all_reachable}<td></td>{/if}
			</tr>
		</tbody>
	</table>
</div>

<style>
.table_scroll {
	max-width: 1200px;
	margin: auto;
	text-align: initial;
}
tr {
	text-align: initial;
}
</style>
