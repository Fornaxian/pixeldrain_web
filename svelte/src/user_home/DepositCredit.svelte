<script>
import { onMount } from "svelte";
import Euro from "../util/Euro.svelte";
import { formatDate } from "../util/Formatting.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import MollieDeposit from "./MollieDeposit.svelte";

let loading = false
let credit_amount = 10
let tab = "mollie"

const checkout = async (network = "", amount = 0, country = "") => {
	loading = true

	if (amount < 10) {
		alert("Amount needs to be at least €10")
		return
	}

	const form = new FormData()
	form.set("amount", amount*1e6)
	form.set("network", network)
	form.set("country", country)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user/invoice",
			{method: "POST", body: form},
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

let invoices = []
let unpaid_invoice = false
const load_invoices = async () => {
	loading = true
	try {
		const resp = await fetch(window.api_endpoint+"/user/invoice")
		if(resp.status >= 400) {
			throw new Error((await resp.json()).message)
		}

		let invoices_tmp = await resp.json()
		unpaid_invoice = false
		invoices_tmp.forEach(row => {
			row.time = new Date(row.time)

			if (row.payment_method === "mollie" && row.status === "open") {
				unpaid_invoice = true
			}
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
	load_invoices()
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2 id="deposit">Deposit credit</h2>
	<p>
		Pixeldrain credit can be used for our prepaid plans, which are different
		from the Patreon plans. With prepaid you only pay for what you use, at a
		rate of €4 per TB per month for storage and €2 per TB for data transfer.
		See the Subscriptions tab for more information about the perks.
	</p>
	<p>
		Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro>
	</p>

	<div class="tab_bar">
		<button on:click={() => tab = "mollie"} class:button_highlight={tab === "mollie"}>
			<i class="icon">euro</i>
			Mollie
		</button>
		<button on:click={() => tab = "btcpay"} class:button_highlight={tab === "btcpay"}>
			<i class="icon">currency_bitcoin</i>
			Crypto
		</button>
	</div>
	{#if tab === "mollie"}
		{#if unpaid_invoice}
			<div class="highlight_yellow">
				<p>
					You still have an unpaid invoice open. Please pay that one
					before requesting a new invoice. You can find unpaid
					invoices at the bottom of this page. You can cancel an
					invoice by clicking Pay, and then clicking the Back link at
					the bottom of the page.
				</p>
			</div>
		{:else}
			<MollieDeposit/>
		{/if}
	{:else if tab === "btcpay"}
		<div class="highlight_border">
			<p style="text-align: initial">
				Alternatively you can use Bitcoin, Lightning network (<a
				href="https://btcpay.pixeldrain.com/embed/uS2mbWjXUuaAqMh8XLjkjwi8oehFuxeBZxekMxv68LN/BTC/ln"
				target="_blank" rel="noreferrer">node info</a>) and Dogecoin to deposit
				credits on your pixeldrain account. You must pay the full amount as
				stated on the invoice, else your payment will fail.
			</p>
			<p style="text-align: initial">
				Do note that it is not possible to withdraw coins from your
				pixeldrain account. It's not a wallet. Any amount of money you
				deposit has to be used up.
			</p>
			Deposit amount €
			<input type="number" bind:value={credit_amount} min="10"/>
			<br/>
			Choose payment method:<br/>
			<button on:click={() => {checkout("btc", credit_amount)}}>
				<i class="icon">currency_bitcoin</i> Bitcoin
			</button>
			<button on:click={() => {checkout("btc_lightning", credit_amount)}}>
				<i class="icon">bolt</i> Lightning network
			</button>
			<button on:click={() => {checkout("doge", credit_amount)}}>
				<span class="icon_unicode">Ð</span> Dogecoin
			</button>
			<button on:click={() => {checkout("xmr", credit_amount)}}>
				<span class="icon_unicode">M</span> Monero
			</button>
		</div>
	{/if}

	<h3 id="invoices">Past invoices</h3>
	<p>
		Invoices are deleted after one year of inactivity.
	</p>
	<div class="table_scroll">
		<table style="text-align: left;">
			<thead>
				<tr>
					<td>ID</td>
					<td>Created</td>
					<td>Amount</td>
					<td>VAT</td>
					<td>Country</td>
					<td>Method</td>
					<td>Status</td>
					<td></td>
				</tr>
			</thead>
			<tbody>
				{#each invoices as row (row.id)}
					<tr>
						<td>{row.id}</td>
						<td>{formatDate(row.time, true, true, false)}</td>
						<td><Euro amount={row.amount}/></td>
						<td><Euro amount={row.vat}/></td>
						<td>{row.country}</td>
						<td>{row.payment_method}</td>
						<td>
							{#if row.status === "InvoiceCreated" || row.status === "open"}
								Waiting for payment
							{:else if row.status === "InvoiceProcessing"}
								Payment received, waiting for confirmations
							{:else if row.status === "InvoiceSettled" || row.status === "paid"}
								Paid
							{:else if row.status === "InvoiceExpired"}
								Expired
							{:else if row.status === "canceled"}
								Canceled
							{:else}
								{row.status}
							{/if}
						</td>
						<td>
							{#if row.status === "New" || row.status === "InvoiceCreated" || row.status === "open"}
								<a href="/api/user/pay_invoice/{row.id}" class="button button_highlight">
									<i class="icon">paid</i> Pay
								</a>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
