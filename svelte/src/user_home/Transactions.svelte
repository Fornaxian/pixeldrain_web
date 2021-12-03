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

let credit_amount = 10

const checkout = async (network) => {
	loading = true
	const form = new FormData()
	form.set("amount", credit_amount*1e6)
	form.set("network", network)

	try {
		const resp = await fetch(
			window.api_endpoint+"/btcpay/deposit",
			{ method: "POST", body: form },
		)
		if(resp.status >= 400) {
			let json = await resp.json()
			throw json.message
		}

		window.location = (await resp.json()).checkout_url
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
}

let show_expired = false
let invoices = []
const load_invoices = async () => {
	loading = true
	try {
		const resp = await fetch(window.api_endpoint+"/btcpay/invoice")
		if(resp.status >= 400) {
			throw new Error((await resp.json()).message)
		}

		let invoices_tmp = await resp.json()
		invoices_tmp.forEach(row => {
			row.time = new Date(row.time)
		})
		invoices_tmp.sort((a, b) => {
			return b.time - a.time
		})
		invoices = invoices_tmp
	} catch (err) {
		console.error(err)
		alert(err)
	} finally {
		loading = false
	}
};

onMount(() => {
	load_transactions()
	load_invoices()
})
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}
	<div class="limit_width">
		<h2>Deposit credits</h2>
		<p>
			You can deposit credit on your pixeldrain account with Bitcoin,
			Lightning network (<a
			href="https://btcpay.pixeldrain.com/embed/uS2mbWjXUuaAqMh8XLjkjwi8oehFuxeBZxekMxv68LN/BTC/ln"
			target="_blank">node info</a>) and Dogecoin. You must pay the full
			amount as stated on the invoice, else your payment will fail.
		</p>
		<p>
			Do note that it is not possible to withdraw coins from your
			pixeldrain account. It's not a wallet. Any amount of money you
			deposit has to be used up.
		</p>
		<div class="indent" style="text-align: center;">
			<form on:submit|preventDefault={() => {checkout("")}} class="checkout_form">
				Deposit amount €
				<input type="number" bind:value={credit_amount} min="1"/>
				<br/>
				Pay with:<br/>
				<button on:click={() => {checkout("btc")}}>
					<span class="icon_unicode">₿</span> Bitcoin
				</button>
				<button on:click={() => {checkout("btc_lightning")}}>
					<i class="icon">bolt</i> Lightning network
				</button>
				<button on:click={() => {checkout("doge")}}>
					<span class="icon_unicode">Ð</span> Dogecoin
				</button>
			</form>
		</div>

		<h3>Open invoices</h3>
		<div class="table_scroll">
			<table style="text-align: left;">
				<thead>
					<tr>
						<td>Created</td>
						<td>Amount</td>
						<td>Status</td>
						<td></td>
					</tr>
				</thead>
				<tbody>
					{#each invoices as row (row.id)}
						{#if row.status === "New" ||
							row.status === "InvoiceCreated" ||
							row.status === "InvoiceProcessing" ||
							show_expired
						}
							<tr>
								<td>{formatDate(row.time, true, true, false)}</td>
								<td><Euro amount={row.amount}></Euro></td>
								<td>
									{#if row.status === "InvoiceCreated"}
										New (waiting for payment)
									{:else if row.status === "InvoiceProcessing"}
										Payment received, waiting for confirmations
									{:else if row.status === "InvoiceSettled"}
										Paid
									{:else if row.status === "InvoiceExpired"}
										Expired
									{:else}
										{row.status}
									{/if}
								</td>
								<td>
									{#if row.status === "New" || row.status === "InvoiceCreated"}
										<a href={row.checkout_url} class="button button_highlight">
											<i class="icon">paid</i> Pay
										</a>
									{/if}
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
			<div style="text-align: center;">
				<button on:click={() => {show_expired = !show_expired}}>
					{#if show_expired}
						Hide
					{:else}
						Show
					{/if}
					expired and settled invoices
				</button>
			</div>
		</div>


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
