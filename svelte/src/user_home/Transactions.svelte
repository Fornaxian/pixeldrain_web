<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";
import Euro from "../util/Euro.svelte"
import LoadingIndicator from "../util/LoadingIndicator.svelte";

let loading = false

let year = 0
let month = 0
let month_str = ""
let transactions = {
	rows: []
}

const load_transactions = async () => {
	loading = true
	month_str = year + "-" + ("00"+(month)).slice(-2)
	try {
		const resp = await fetch(window.api_endpoint+"/user/transactions/"+month_str)
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
			total_subscription_charge: 0,
			total_storage_charge: 0,
			total_bandwidth_charge: 0,
			total_kickback_fee: 0,
			total_deposited: 0,
			total_deducted: 0,
		}

		month.rows.forEach(row => {
			row.time = new Date(row.time)
			month.total_deposited += row.deposit_amount
			month.total_subscription_charge += row.subscription_charge
			month.total_storage_charge += row.storage_charge
			month.total_bandwidth_charge += row.bandwidth_charge
			month.total_kickback_fee += row.kickback_fee
			month.total_deducted += row.subscription_charge + row.storage_charge + row.bandwidth_charge
		})
		transactions = month
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
};
const last_month = () => {
	month--
	if (month === 0) {
		month = 12
		year--
	}

	load_transactions()
}
const next_month = () => {
	month++
	if (month === 13) {
		month = 1
		year++
	}

	load_transactions()
}

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
	let now = new Date()
	year = now.getFullYear()
	month = now.getMonth()+1

	load_transactions()
	load_invoices()
})
</script>

<LoadingIndicator loading={loading}/>

<section>
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
	<div style="text-align: center;">
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

	<h3>{month_str}</h3>
	<div class="toolbar">
		<button on:click={last_month}>
			<i class="icon">chevron_left</i>
			Previous month
		</button>
		<div class="toolbar_spacer"></div>
		<button on:click={next_month}>
			Next month
			<i class="icon">chevron_right</i>
		</button>
	</div>
	<ul>
		<li>Subscription charge: <Euro amount={transactions.total_subscription_charge}></Euro></li>
		<li>Storage charge: <Euro amount={transactions.total_storage_charge}></Euro></li>
		<li>Bandwidth charge: <Euro amount={transactions.total_bandwidth_charge}></Euro></li>
		<li>Total charge: <Euro amount={transactions.total_deducted}></Euro></li>
		<li>Earned: <Euro amount={transactions.total_kickback_fee}></Euro></li>
		<li>Deposited: <Euro amount={transactions.total_deposited}></Euro></li>
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
					<td colspan="2">Kickback</td>
					<td>Deposit</td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td>Charge</td>
					<td>Charge</td>
					<td>Usage</td>
					<td>Charge</td>
					<td>Usage</td>
					<td>Fee</td>
					<td>Amount</td>
					<td></td>
				</tr>
			</thead>
			<tbody>
				{#each transactions.rows as row}
					<tr>
						<td>{formatDate(row.time, true, true, false)}</td>
						<td><Euro amount={row.new_balance}></Euro></td>
						<td><Euro amount={row.subscription_charge} precision="4"></Euro></td>
						<td><Euro amount={row.storage_charge} precision="4"></Euro></td>
						<td>{formatDataVolume(row.storage_used, 3)}</td>
						<td><Euro amount={row.bandwidth_charge} precision="4"></Euro></td>
						<td>{formatDataVolume(row.bandwidth_used, 3)}</td>
						<td><Euro amount={row.kickback_fee} precision="4"></Euro></td>
						<td>{formatDataVolume(row.kickback_amount, 3)}</td>
						<td><Euro amount={row.deposit_amount}></Euro></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
</style>
