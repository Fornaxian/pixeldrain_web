<script>
import { onMount } from "svelte";
import Euro from "../util/Euro.svelte";
import { formatDate } from "../util/Formatting.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import MollieDeposit from "./MollieDeposit.svelte";

let loading = false
let credit_amount = 10

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
const load_invoices = async () => {
	loading = true
	try {
		const resp = await fetch(window.api_endpoint+"/user/invoice")
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
	load_invoices()
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2 id="deposit">Deposit credits</h2>
	<p>
		Pixeldrain credits can be used for our prepaid plans, which are
		different from the Patreon plans. With prepaid you only pay for what you
		use, at a rate of €4 per TB per month for storage and €2 per TB for data
		transfer.
	</p>
	<p>
		Use the form below to deposit credit on your pixeldrain account using
		Mollie. The minimum deposit is €10.
	</p>

	<MollieDeposit/>

	<h3>Crypto payments</h3>
	<p>
		Alternatively you can use Bitcoin, Lightning network (<a
		href="https://btcpay.pixeldrain.com/embed/uS2mbWjXUuaAqMh8XLjkjwi8oehFuxeBZxekMxv68LN/BTC/ln"
		target="_blank" rel="noreferrer">node info</a>) and Dogecoin to deposit
		credits on your pixeldrain account. You must pay the full amount as
		stated on the invoice, else your payment will fail.
	</p>
	<p>
		Do note that it is not possible to withdraw coins from your
		pixeldrain account. It's not a wallet. Any amount of money you
		deposit has to be used up.
	</p>
	<div class="highlight_border">
		Deposit amount €
		<input type="number" bind:value={credit_amount} min="10"/>
		<br/>
		Choose payment method:<br/>
		<button on:click={() => {checkout("btc", credit_amount)}}>
			<span class="icon_unicode">₿</span> Bitcoin
		</button>
		<button on:click={() => {checkout("btc_lightning", credit_amount)}}>
			<i class="icon">bolt</i> Lightning network
		</button>
		<button on:click={() => {checkout("doge", credit_amount)}}>
			<span class="icon_unicode">Ð</span> Dogecoin
		</button>
	</div>

	<h3 id="invoices">Past invoices</h3>
	<p>
		Invoices are deleted after one year of inactivity.
	</p>
	<div class="table_scroll">
		<table style="text-align: left;">
			<thead>
				<tr>
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
