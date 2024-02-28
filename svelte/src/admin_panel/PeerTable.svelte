<script>
import { formatDataVolume } from "../util/Formatting.svelte";
import SortButton from "./SortButton.svelte";

export let peers = [];
$: update_peers(peers)
let update_peers = (peers) => {
	for (let peer of peers) {
		peer.avg_network_total = peer.avg_network_tx + peer.avg_network_rx
	}

	sort("")
}

let sort_field = "address"
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
				<td><SortButton field="address" active_field={sort_field} asc={asc} sort_func={sort}>Address</SortButton></td>
				<td><SortButton field="unreachable_count" active_field={sort_field} asc={asc} sort_func={sort}>Err</SortButton></td>
				<td><SortButton field="load_1_min" active_field={sort_field} asc={asc} sort_func={sort}>1m</SortButton></td>
				<td><SortButton field="load_5_min" active_field={sort_field} asc={asc} sort_func={sort}>5m</SortButton></td>
				<td><SortButton field="load_15_min" active_field={sort_field} asc={asc} sort_func={sort}>15m</SortButton></td>
				<td><SortButton field="latency" active_field={sort_field} asc={asc} sort_func={sort}>Ping</SortButton></td>
				<td><SortButton field="avg_network_tx" active_field={sort_field} asc={asc} sort_func={sort}>TX</SortButton></td>
				<td><SortButton field="avg_network_rx" active_field={sort_field} asc={asc} sort_func={sort}>RX</SortButton></td>
				<td><SortButton field="avg_network_total" active_field={sort_field} asc={asc} sort_func={sort}>Tot</SortButton></td>
				<td><SortButton field="free_space" active_field={sort_field} asc={asc} sort_func={sort}>Free</SortButton></td>
				<td><SortButton field="min_free_space" active_field={sort_field} asc={asc} sort_func={sort}>Min free</SortButton></td>
			</tr>
		</thead>
		<tbody>
			{#each peers as peer}
				<tr style="text-align: left; border: none;"
					class:highlight_red={peer.free_space < peer.min_free_space / 2 || !peer.reachable}
					class:highlight_yellow={peer.free_space < peer.min_free_space}
					class:highlight_green={peer.reachable}
				>
					<td>{peer.address}</td>
					<td>{peer.unreachable_count}</td>
					<td>{peer.load_1_min.toFixed(1)}</td>
					<td>{peer.load_5_min.toFixed(1)}</td>
					<td>{peer.load_15_min.toFixed(1)}</td>
					<td>{(peer.latency/1000).toPrecision(3)}</td>
					<td>{formatDataVolume(peer.avg_network_tx, 3)}/s</td>
					<td>{formatDataVolume(peer.avg_network_rx, 3)}/s</td>
					<td>{formatDataVolume(peer.avg_network_tx+peer.avg_network_rx, 3)}/s</td>
					<td>{formatDataVolume(peer.free_space, 4)}</td>
					<td>{formatDataVolume(peer.min_free_space, 3)}</td>
				</tr>
			{/each}

			<tr style="text-align: left;">
				<td>Total ({peers.length})</td>
				<td>{peers.reduce((acc, val) => acc += val.unreachable_count, 0)}</td>
				<td>{peers.reduce((acc, val) => acc += val.load_1_min, 0).toFixed(1)}</td>
				<td>{peers.reduce((acc, val) => acc += val.load_5_min, 0).toFixed(1)}</td>
				<td>{peers.reduce((acc, val) => acc += val.load_15_min, 0).toFixed(1)}</td>
				<td>{(peers.reduce((acc, val) => acc += val.latency, 0)/1000).toFixed(0)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_tx, 0), 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_rx, 0), 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_tx+val.avg_network_rx, 0), 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.free_space, 0), 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.min_free_space, 0), 3)}</td>
			</tr>
			<tr style="text-align: left;">
				<td>Average</td>
				<td></td>
				<td>{(peers.reduce((acc, val) => acc += val.load_1_min, 0) / peers.length).toFixed(1)}</td>
				<td>{(peers.reduce((acc, val) => acc += val.load_5_min, 0) / peers.length).toFixed(1)}</td>
				<td>{(peers.reduce((acc, val) => acc += val.load_15_min, 0) / peers.length).toFixed(1)}</td>
				<td>{(peers.reduce((acc, val) => acc += val.latency, 0) / 1000 / peers.length).toFixed(0)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_tx, 0) / peers.length, 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_rx, 0) / peers.length, 3)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_tx+val.avg_network_rx, 3) / peers.length, 4)}/s</td>
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
</style>
