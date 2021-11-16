<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";
import Euro from "../util/Euro.svelte"

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
		<h2>Transaction log</h2>
		<p>
			Here is a log of all transactions on your account balance.
		</p>

		{#each months as month}
			<h3>{month.month}</h3>
			<ul>
				<li>Subscription charge: <Euro amount={month.total_subscription_charge}></Euro></li>
				<li>Storage charge: <Euro amount={month.total_storage_charge}></Euro></li>
				<li>Bandwidth charge: <Euro amount={month.total_bandwidth_charge}></Euro></li>
				<li>Total charge: <Euro amount={month.total_deducted}></Euro></li>
				<li>Deposited: <Euro amount={month.total_deposited}></Euro></li>
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
								<td><Euro amount={row.new_balance}></Euro></td>
								<td><Euro amount={row.subscription_charge} precision="4"></Euro></td>
								<td><Euro amount={row.storage_charge} precision="4"></Euro></td>
								<td>{formatDataVolume(row.storage_used, 3)}</td>
								<td><Euro amount={row.bandwidth_charge} precision="4"></Euro></td>
								<td>{formatDataVolume(row.bandwidth_used, 3)}</td>
								<td><Euro amount={row.deposit_amount}></Euro></td>
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
