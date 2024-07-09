<script>
import { onMount } from "svelte";
import HotlinkProgressBar from "../HotlinkProgressBar.svelte";
import StorageProgressBar from "../StorageProgressBar.svelte";


let transfer_cap = 0
let transfer_used = 0
let storage_used = window.user.storage_space_used
let storage_limit = window.user.subscription.storage_space
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

Storage space used:
<StorageProgressBar used={storage_used} total={storage_limit}/>

<br/>

Premium data transfer:
(<a href="/user/sharing/bandwidth">set custom limit</a>)
<HotlinkProgressBar used={transfer_used} total={transfer_cap}></HotlinkProgressBar>
