<script>
import Spinner from "../util/Spinner.svelte";
import Euro from "../util/Euro.svelte"
import ProgressBar from "../util/ProgressBar.svelte";
import { onMount } from "svelte";
import { formatDataVolume } from "../util/Formatting.svelte";

let loading = false
let subscription = window.user.subscription.id

let result = ""
let result_success = false

const update = async (update_field) => {
	loading = true

	const form = new FormData()
	if (update_field === "subscription") {
		form.append("update", "subscription")
		form.append("subscription", subscription)
	} else if (update_field === "limits") {
		form.append("update", "limits")
		form.append("hotlinking_enabled", hotlinking)
		form.append("transfer_cap", transfer_cap*1e9)
	} else {
		console.error("Invalid update type", update_field)
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/user/subscription",
			{ method: "PUT", body: form },
		)
		if(resp.status >= 400) {
			let json = await resp.json()
			throw json.message
		}

		result_success = true
		result = "Subscription updated"
	} catch (err) {
		result_success = false
		result = "Failed to update subscription: "+err
	} finally {
		loading = false
	}
}

let hotlinking = window.user.hotlinking_enabled
let transfer_cap = window.user.monthly_transfer_cap / 1e9
let transfer_used = 0
let load_tranfer_used = () => {
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
onMount(load_tranfer_used)

</script>

{#if loading}
	<div class="spinner_container">
		<Spinner />
	</div>
{/if}
<section>
	<h2>Manage subscription</h2>
	{#if window.user.subscription.type !== "patreon"}
		<p>
			Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro>
		</p>
		<p>
			When your prepaid subscription is active you will be charged daily
			based on usage. Hotlink bandwidth is charged per TB based on the
			usage of the previous day. The amount charged for storage each day
			is your storage usage at the end of the day multiplied by the
			storage price (€4 / TB) and divided by the average number of days in
			a month (30.4375). So if you have exactly 1 TB on your account you
			will be charged €0.131416838 per day.
		</p>
		<p>
			The prepaid subscription will stay active for as long as you have
			credit on your account. When you reach negative balance the
			subscription will automatically end. You will need a positive
			balance to activate the subscription again.
		</p>

		<h3>Prepaid plans</h3>
		{#if result !== ""}
			<div class:highlight_green={result_success} class:highlight_red={!result_success}>
				{result}
			</div>
		{/if}

		<div class="feat_table">
			<div>
				<div class="feat_label" class:feat_highlight={subscription === "prepaid"}>
					Prepaid<br/>
					{#if subscription === "prepaid"}
						Currently active
					{:else}
						<button on:click={() => {subscription = "prepaid"; update("subscription")}}>
							<i class="icon">attach_money</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal round_tr" class:feat_highlight={subscription === "prepaid"}>
					<ul>
						<li>Base price of €1 per month</li>
						<li>€4 per TB per month for storage</li>
						<li>€2 per TB for data transfer</li>
						<li>Files never expire as long as subscription is active</li>
					</ul>
				</div>
			</div>
			<div>
				<div class="feat_label" class:feat_highlight={subscription === "prepaid_temp_storage_120d"}>
					120 days storage<br/>
					{#if subscription === "prepaid_temp_storage_120d"}
						Currently active
					{:else}
						<button on:click={() => {subscription = "prepaid_temp_storage_120d"; update("subscription")}}>
							<i class="icon">attach_money</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal" class:feat_highlight={subscription === "prepaid_temp_storage_120d"}>
					<ul>
						<li>Base price of €1 per month</li>
						<li>€1 per TB per month for storage</li>
						<li>€2 per TB for data transfer</li>
						<li>Files expire 120 days after the last time they're viewed</li>
					</ul>
				</div>
			</div>
			<div>
				<div class="feat_label" class:feat_highlight={subscription === "prepaid_temp_storage_60d"}>
					60 days storage<br/>
					{#if subscription === "prepaid_temp_storage_60d"}
						Currently active
					{:else}
						<button on:click={() => {subscription = "prepaid_temp_storage_60d"; update("subscription")}}>
							<i class="icon">attach_money</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal" class:feat_highlight={subscription === "prepaid_temp_storage_60d"}>
					<ul>
						<li>Base price of €1 per month</li>
						<li>€0.50 per TB per month for storage</li>
						<li>€2 per TB for data transfer</li>
						<li>Files expire 60 days after the last time they're viewed</li>
					</ul>
				</div>
			</div>
			<div>
				<div class="feat_label" class:feat_highlight={subscription === ""}>
					Free<br/>
					{#if subscription === ""}
						Currently active
					{:else}
						<button on:click={() => {subscription = ""; update("subscription")}}>
							<i class="icon">money_off</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal round_br" class:feat_highlight={subscription === ""}>
					<ul>
						<li>Standard free plan, files expire after 30 days.</li>
					</ul>
				</div>
			</div>
		</div>
	{/if}

	<h3>Bandwidth sharing</h3>
	{#if hotlinking}
		<button on:click={() => { hotlinking = false; update("limits") }}>
			<i class="icon green">check</i> ON (click to turn off)
		</button>
	{:else}
		<button on:click={() => { hotlinking = true; update("limits") }}>
			<i class="icon red">close</i> OFF (click to turn on)
		</button>
	{/if}
	<p>
		When bandwidth sharing is enabled all the bandwidth that your files
		use will be subtracted from your data cap. Advertisements will be
		disabled on the download pages for your files and download speed
		will be unlimited. The rate limiting captcha for files is also
		disabled when bandwidth sharing is on. You can directly embed your
		file's download link anywhere, you don't need to use the file viewer
		page.
	</p>

	<h3>Bill shock limit</h3>
	<p>
		Billshock limit in gigabytes per month (1 TB = 1000 GB). Set to 0 to disable.
	</p>
	<form on:submit|preventDefault={() => {update("limits")}} class="billshock_container">
		<input type="number" bind:value={transfer_cap} step="100" min="0"/>
		<div style="margin: 0.5em;">GB</div>
		<button type="submit">
			<i class="icon">save</i> Save
		</button>
	</form>

	Bandwidth used in the last 30 days: {formatDataVolume(transfer_used, 3)},
	new limit: {formatDataVolume(transfer_cap*1e9, 3)}
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
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}

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

.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}
.feat_table {
	display: flex;
	flex-direction: column;
}
.feat_table > div {
	display: flex;
	flex-direction: row;
}
.feat_table > div > div:first-child {
	flex: 0 0 25%;
	max-width: 25%;
}
.feat_table > div > div {
	flex: 1 1 0;
	margin: 0.25em;
	padding: 0.5em;
	word-wrap: break-word;
	hyphens: auto;
}
.feat_table > div > .feat_label {
	border-top-left-radius: 0.5em;
	border-bottom-left-radius: 0.5em;
	border: 2px solid var(--separator);
	font-size: 1.1em;
}
.feat_table > div > .feat_normal {
	background: var(--card_color);
}
.feat_table > div > .feat_highlight {
	border: 2px solid var(--highlight_color)
}

.feat_table > div > div.round_tr { border-top-right-radius:    0.5em; }
.feat_table > div > div.round_br { border-bottom-right-radius: 0.5em; }
</style>
