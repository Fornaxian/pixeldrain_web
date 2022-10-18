<script>
import { onMount } from "svelte";
import { formatDataVolume } from "../util/Formatting.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import ProgressBar from "../util/ProgressBar.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";

let loading = false
let success_message

const update = async () => {
	loading = true

	const form = new FormData()
	form.append("update", "limits")
	form.append("hotlinking_enabled", hotlinking)
	form.append("transfer_cap", transfer_cap*1e9)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user/subscription",
			{ method: "PUT", body: form },
		)
		if(resp.status >= 400) {
			let json = await resp.json()
			throw json.message
		}

		window.user.hotlinking_enabled = hotlinking
		window.user.monthly_transfer_cap = transfer_cap*1e9

		success_message.set(true, "Sharing settings updated")
	} catch (err) {
		success_message.set(false, "Failed to update subscription: "+err)
	} finally {
		loading = false
	}
}

let hotlinking = window.user.hotlinking_enabled
let toggle_hotlinking = () => {
	hotlinking = !hotlinking
	update()
}

let transfer_cap = window.user.monthly_transfer_cap / 1e9
let transfer_used = 0
let load_transfer_used = () => {
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
		transfer_used = resp.amounts.reduce((acc, cur) => { return acc + cur }, 0)
	}).catch(e => {
		console.error("Error requesting time series: " + e);
	})
}

onMount(() => {
	load_transfer_used()
})

</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2>Bandwidth sharing</h2>
	<SuccessMessage bind:this={success_message}></SuccessMessage>

	<button on:click={toggle_hotlinking}>
		{#if hotlinking}
			<i class="icon green">check</i> ON (click to turn off)
		{:else}
			<i class="icon red">close</i> OFF (click to turn on)
		{/if}
	</button>
	<p>
		When bandwidth sharing is enabled all the bandwidth that your files
		use will be subtracted from your data cap. Advertisements will be
		disabled on the download pages for your files and download speed
		will be unlimited. The rate limiting captcha for files is also
		disabled when bandwidth sharing is on. You can directly embed your
		file's download link anywhere, you don't need to use the file viewer
		page.
	</p>

	<h2>Bill shock limit</h2>
	<p>
		Billshock limit in gigabytes per month (1 TB = 1000 GB). Set to 0 to disable.
	</p>
	<form on:submit|preventDefault={update} class="billshock_container">
		<input type="number" bind:value={transfer_cap} step="100" min="0"/>
		<div style="margin: 0.5em;">GB</div>
		<button type="submit">
			<i class="icon">save</i> Save
		</button>
	</form>

	<p>
		Bandwidth used in the last 30 days: {formatDataVolume(transfer_used, 3)},
		new limit: {formatDataVolume(transfer_cap*1e9, 3)}
	</p>
	<ProgressBar used={transfer_used} total={transfer_cap*1e9}></ProgressBar>
	<p>
		The billshock limit limits how much bandwidth your account can use
		in a 30 day window. When this limit is reached files will show ads
		again and can only be downloaded from the file viewer page. This is
		mostly useful for prepaid plans, but it works for patreon plans too.
		Set to 0 to disable the limit.
	</p>
</section>

<style>
.green {
	color: var(--highlight_color);
}
.red {
	color: var(--danger_color);
}
.billshock_container {
	display: flex;
	flex-direction: row;
	align-items: center;
}
</style>
