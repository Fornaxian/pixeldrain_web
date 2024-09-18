<script>
import { flip } from "svelte/animate";
import { formatDataVolume } from "../util/Formatting.svelte";
import SortButton from "./SortButton.svelte";

export let peers = [];
$: update_peers(peers)
let update_peers = (peers) => {
	for (let peer of peers) {
		peer.avg_network_total = peer.avg_network_tx + peer.avg_network_rx
		peer.network_ratio = Math.max(peer.avg_network_tx, peer.avg_network_rx) / Math.min(peer.avg_network_tx, peer.avg_network_rx)
		if (peer.network_ratio === NaN) {
			peer.network_ratio = 1
		}
	}

	sort("")
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
		if (typeof (a[field]) === "number") {
			// Sort ints from high to low
			if (asc) {
				return a[field] - b[field]
			} else {
				return b[field] - a[field]
			}
		} else {
			// Sort strings alphabetically
			if (asc) {
				return a[field].localeCompare(b[field])
			} else {
				return b[field].localeCompare(a[field])
			}
		}
	})
	peers = peers
}
</script>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td><SortButton field="hostname" active_field={sort_field} asc={asc} sort_func={sort}>Hostname</SortButton></td>
				<td><SortButton field="ip" active_field={sort_field} asc={asc} sort_func={sort}>Address</SortButton></td>
				<td><SortButton field="unreachable_count" active_field={sort_field} asc={asc} sort_func={sort}>Err</SortButton></td>
				<td><SortButton field="load_15_min" active_field={sort_field} asc={asc} sort_func={sort}>Load</SortButton></td>
				<td><SortButton field="latency" active_field={sort_field} asc={asc} sort_func={sort}>Ping</SortButton></td>
				<td><SortButton field="avg_network_tx" active_field={sort_field} asc={asc} sort_func={sort}>TX</SortButton></td>
				<td><SortButton field="avg_network_rx" active_field={sort_field} asc={asc} sort_func={sort}>RX</SortButton></td>
				<td><SortButton field="network_ratio" active_field={sort_field} asc={asc} sort_func={sort}>Rat</SortButton></td>
				<td><SortButton field="avg_network_total" active_field={sort_field} asc={asc} sort_func={sort}>Tot</SortButton></td>
				<td><SortButton field="free_space" active_field={sort_field} asc={asc} sort_func={sort}>Free</SortButton></td>
				<td><SortButton field="min_free_space" active_field={sort_field} asc={asc} sort_func={sort}>Min free</SortButton></td>
			</tr>
		</thead>
		<tbody>
			{#each peers as peer (peer.ip)}
				<tr style="border: none;"
					class:highlight_red={!peer.reachable}
					class:highlight_yellow={peer.free_space < peer.min_free_space / 2}
					class:highlight_blue={peer.free_space < peer.min_free_space}
					class:highlight_green={peer.reachable}
					animate:flip={{duration: 1000}}
				>
					<td>{peer.hostname}</td>
					<td>{peer.ip}</td>
					<td>{peer.unreachable_count}</td>
					<td>{peer.load_1_min.toFixed(1)} / {peer.load_5_min.toFixed(1)} / {peer.load_15_min.toFixed(1)}</td>
					<td>{(peer.latency/1000).toFixed(3)}</td>
					<td>{formatDataVolume(peer.avg_network_tx, 3)}/s</td>
					<td>{formatDataVolume(peer.avg_network_rx, 3)}/s</td>
					<td>{peer.network_ratio.toFixed(2)}</td>
					<td>{formatDataVolume(peer.avg_network_total, 3)}/s</td>
					<td>{formatDataVolume(peer.free_space, 4)}</td>
					<td>{formatDataVolume(peer.min_free_space, 3)}</td>
				</tr>
			{/each}

			<tr>
				<td colspan="2">Total ({peers.length})</td>
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
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.free_space, 0), 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.min_free_space, 0), 3)}</td>
			</tr>
			<tr>
				<td colspan="2">Average</td>
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
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.free_space, 0) / peers.length, 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.min_free_space, 0) / peers.length, 3)}</td>
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
