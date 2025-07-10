<script>
import { onMount } from "svelte";
import HotlinkProgressBar from "user_home/HotlinkProgressBar.svelte";
import StorageProgressBar from "user_home/StorageProgressBar.svelte";
import ProgressBar from "util/ProgressBar.svelte";

let transfer_cap = 0
let transfer_used = 0
let storage_limit = window.user.subscription.storage_space
let fs_storage_limit = window.user.subscription.filesystem_storage_limit
let load_direct_bw = () => {
	let today = new Date()
	let start = new Date()
	start.setDate(start.getDate() - 30)

	fetch(
		window.api_endpoint + "/user/time_series/transfer_paid" +
		"?start=" + start.toISOString() +
		"&end=" + today.toISOString() +
		"&interval=60"
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: " + resp.status); }
		return resp.json();
	}).then(resp => {
		let total = resp.amounts.reduce((accum, val) => accum += val, 0);
		transfer_used = total
	}).catch(e => {
		console.error("Error requesting time series: " + e);
	})
}

onMount(() => {
	if (window.user.monthly_transfer_cap > 0) {
		transfer_cap = window.user.monthly_transfer_cap
	} else if (window.user.subscription.monthly_transfer_cap > 0) {
		transfer_cap = window.user.subscription.monthly_transfer_cap
	} else {
		transfer_cap = -1
	}

	load_direct_bw()
})

</script>

Total storage space used:
<StorageProgressBar used={window.user.storage_space_used} total={storage_limit}/>
<br/>

{#if window.user.subscription.filesystem_access === true}
	Filesystem storage space used:
	<StorageProgressBar
		used={window.user.filesystem_storage_used}
		total={fs_storage_limit > 0 ? fs_storage_limit : storage_limit}
		disable_warnings
	/>
	<br/>
{/if}

Premium data transfer:
(<a href="/user/sharing/bandwidth">set custom limit</a>)
<HotlinkProgressBar used={transfer_used} total={transfer_cap}></HotlinkProgressBar>

<br/>
File count (does not apply to filesystem)
<ProgressBar total={10000} used={window.user.file_count}></ProgressBar>
<div class="gauge_labels">
	<div>{window.user.file_count}</div>
	<div>10000</div>
</div>

<style>
.gauge_labels {
	display: flex;
	justify-content: space-between;
	line-height: 1em;
}
.gauge_labels > div {
	flex: 0 0 auto;
}
</style>
