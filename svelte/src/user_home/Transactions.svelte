<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate, formatEuros } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = false
let months = []

const load_transactions = async () => {
	loading = true
	try {
		// We keep fetching history until there is no history left
		let now = new Date()
		while (true) {
			const resp = await fetch(
				window.api_endpoint+"/user/transactions/" +
					now.getFullYear()+"-"+("00"+(now.getMonth()+1)).slice(-2),
			)
			if(resp.status >= 400) {
				let json = await resp.json()
				if (json.value === "authentication_failed") {
					window.location = "/login"
					return
				} else {
					throw new Error(json.message)
				}
			}

			let month = {
				rows: await resp.json(),
				month: now.getFullYear()+"-"+("00"+(now.getMonth()+1)).slice(-2),
				total_subscription_charge: 0,
				total_storage_charge: 0,
				total_bandwidth_charge: 0,
				total_deposited: 0,
				total_deducted: 0,
			}

			if (month.rows.length === 0) {
				break
			}

			month.rows.forEach(row => {
				row.time = new Date(row.time)
				month.total_deposited += row.deposit_amount
				month.total_subscription_charge += row.subscription_charge
				month.total_storage_charge += row.storage_charge
				month.total_bandwidth_charge += row.bandwidth_charge
				month.total_deducted += row.subscription_charge + row.storage_charge + row.bandwidth_charge
			})
			months.push(month)
			months = months

			// Fetch the previous month
			now.setMonth(now.getMonth()-1)
		}
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
};

let result = ""
let result_success = false

const update_subscription = async name => {
	loading = true

	const form = new FormData()
	form.append("subscription", name)
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

		setTimeout(() => {location.reload()}, 2000)
	} catch (err) {
		result_success = false
		result = "Failed to update subscription: "+err
		loading = false
	}
}

onMount(() => {
	load_transactions()
})
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}
	<div class="limit_width">
		<h2>Manage subscription</h2>
		<p>
			Current account balance: {formatEuros(window.user.balance_micro_eur, 4)}
		</p>

		{#if result !== ""}
			<div class:highlight_green={result_success} class:highlight_red={!result_success}>
				{result}
			</div>
		{/if}

		<div class="highlight_dark">
			{#if window.user.subscription.id !== "prepaid"}
				Prepaid subscription is not active.<br/>
				<button on:click={() => {update_subscription("prepaid")}}>
					<i class="icon">attach_money</i>
					Enable prepaid subscription
				</button>
			{:else}
				Prepaid subscription is active.<br/>
				Deactivating your subscription may cause your files to expire
				sooner than expected!<br/>
				<button on:click={() => {update_subscription("none")}}>
					<i class="icon">money_off</i>
					Disable prepaid subscription
				</button>
			{/if}
		</div>
		<p>
			When your prepaid subscription is active you will be charged:
		</p>
		<ul>
			<li>
				€4 per TB per month for storage. The amount is charged per day
				and divided by the average number of days in a month (30.4375).
				So if you have exactly 1 TB on your account you will be charged
				€0.131416838 per day.
			</li>
			<li>
				€2 per TB of bandwidth, charged every day based on the usage of
				the previous day
			</li>
			<li>
				€2 per month for the subscription itself, because prepaid has
				the same perks as the Pro subscription (No advertisements, no
				bandwidth limit, video player, etc)
			</li>
		</ul>

		<h2>Transaction log</h2>
		<p>
			Here is a log of all transactions on your account balance.
		</p>

		{#each months as month}
			<h3>{month.month}</h3>
			<ul>
				<li>Subscription charge: {formatEuros(month.total_subscription_charge, 4)}</li>
				<li>Storage charge: {formatEuros(month.total_storage_charge, 4)}</li>
				<li>Bandwidth charge: {formatEuros(month.total_bandwidth_charge, 4)}</li>
				<li>Total charge: {formatEuros(month.total_deducted, 4)}</li>
				<li>Deposited: {formatEuros(month.total_deposited, 4)}</li>
			</ul>

			<div class="table_scroll">
				<table style="text-align: left;">
					<thead>
						<tr>
							<td>Time</td>
							<td>Balance</td>
							<td>Subscription</td>
							<td colspan="2">Storage</td>
							<td colspan="2">Bandwidth</td>
							<td>Deposited</td>
						</tr>
						<tr>
							<td></td>
							<td></td>
							<td>Charged</td>
							<td>Charged</td>
							<td>Used</td>
							<td>Charged</td>
							<td>Used</td>
							<td></td>
						</tr>
					</thead>
					<tbody>
						{#each month.rows as row}
							<tr>
								<td>{formatDate(row.time, true, true, false)}</td>
								<td>{formatEuros(row.new_balance, 4)}</td>
								<td>{formatEuros(row.subscription_charge, 4)}</td>
								<td>{formatEuros(row.storage_charge, 4)}</td>
								<td>{formatDataVolume(row.storage_used, 3)}</td>
								<td>{formatEuros(row.bandwidth_charge, 4)}</td>
								<td>{formatDataVolume(row.bandwidth_used, 3)}</td>
								<td>{formatEuros(row.deposit_amount, 4)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	</div>
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}
</style>
