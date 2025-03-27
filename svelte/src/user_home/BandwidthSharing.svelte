<script>
import { onMount } from "svelte";
import Pro from "../icons/Pro.svelte";
import { formatDataVolume } from "../util/Formatting.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import ProgressBar from "../util/ProgressBar.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";

let loading = false
let success_message
let hotlinking = window.user.hotlinking_enabled
let transfer_cap = window.user.monthly_transfer_cap / 1e9
let skip_viewer = window.user.skip_file_viewer

const update = async () => {
	loading = true

	const form = new FormData()
	form.append("hotlinking_enabled", hotlinking)
	form.append("transfer_cap", transfer_cap*1e9)
	form.append("skip_file_viewer", skip_viewer)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user",
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

let toggle_hotlinking = () => {
	hotlinking = !hotlinking
	update()
}

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

let toggle_skip_viewer = () => {
	skip_viewer = !skip_viewer
	update()
}

onMount(() => {
	load_transfer_used()
})

</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2><Pro/>Hotlinking (bandwidth sharing)</h2>
	<SuccessMessage bind:this={success_message}></SuccessMessage>

	<button on:click={toggle_hotlinking}>
		{#if hotlinking}
			<i class="icon green">check</i> ON (click to turn off)
		{:else}
			<i class="icon red">close</i> OFF (click to turn on)
		{/if}
	</button>
	<p>
		When hotlinking is enabled all the bandwidth that your files use will be
		subtracted from your data cap. Advertisements will be disabled on the
		download pages for your files and download speed will be unlimited. The
		rate limiting captcha for files is also disabled when hotlinking is on.
		You can directly embed your file's download link anywhere, you don't
		need to use the file viewer page.
	</p>

	<h2><Pro/>Bill shock limit</h2>
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
		The billshock limit limits how much bandwidth your account can use in a
		30 day window. When this limit is reached hotlinking will be disabled
		and you will no longer be charged for bandwidth usage. This is mostly
		useful for the Prepaid subscription, but it works for Patreon plans too.
		Set to 0 to disable the limit.
	</p>

	<h2><Pro/>Skip download page</h2>
	<button on:click={toggle_skip_viewer}>
		{#if skip_viewer}
			<i class="icon green">check</i> ON (click to turn off)
		{:else}
			<i class="icon red">close</i> OFF (click to turn on)
		{/if}
	</button>
	<p>
		This setting only applies to your account, others will still see the
		download page when visiting your files. When this is enabled you will be
		redirected to the file download API when clicking a pixeldrain link.
		This means that images, videos and PDF files will be opened directly in
		your browser, and other files are immediately downloaded to your device.
		This only works for single file links, not albums. You will need a Pro
		subscription to use this feature.
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
