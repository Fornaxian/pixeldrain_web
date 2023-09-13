<script>
import { formatDataVolume } from "../util/Formatting.svelte";

export let peers = [];

</script>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td>Address</td>
				<td>Err</td>
				<td>1m</td>
				<td>5m</td>
				<td>15m</td>
				<td>Ping</td>
				<td>Netload</td>
				<td>Free</td>
				<td>Min free</td>
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
					<td>{formatDataVolume(peer.avg_network_load, 4)}/s</td>
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
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_load, 0), 4)}/s</td>
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
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.avg_network_load, 0) / peers.length, 4)}/s</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.free_space, 0) / peers.length, 4)}</td>
				<td>{formatDataVolume(peers.reduce((acc, val) => acc += val.min_free_space, 0) / peers.length, 3)}</td>
			</tr>
		</tbody>
	</table>
</div>
