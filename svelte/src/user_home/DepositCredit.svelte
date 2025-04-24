<script>
import CreditDeposit from "layout/CreditDeposit.svelte";
import { onMount } from "svelte";
import Euro from "util/Euro.svelte";
import { formatDate } from "util/Formatting";
import LoadingIndicator from "util/LoadingIndicator.svelte";

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
let unpaid_invoice = 0
const load_invoices = async () => {
	loading = true
	try {
		const resp = await fetch(window.api_endpoint+"/user/invoice")
		if(resp.status >= 400) {
			throw new Error((await resp.json()).message)
		}

		let invoices_tmp = await resp.json()
		unpaid_invoice = 0
		invoices_tmp.forEach(row => {
			row.time = new Date(row.time)

			if (row.status === "open") {
				unpaid_invoice++
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
		Pixeldrain credit can be used for our Prepaid subscription plan, which
		is different from the Patreon plans. Instead of monthly limits, with
		Prepaid there are no limits. You pay for what you use, at a rate of €4
		per TB per month for storage and €1 per TB for data transfer. Your
		current account balance is <Euro
		amount={window.user.balance_micro_eur}/>
	</p>

	{#if unpaid_invoice > 1}
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
		<CreditDeposit/>
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
							{#if row.status === "open"}
								Waiting for payment
							{:else if row.status === "processing"}
								Payment received, waiting for confirmations
							{:else if row.status === "paid"}
								Paid
							{:else if row.status === "expired"}
								Expired
							{:else if row.status === "canceled"}
								Canceled
							{:else}
								{row.status}
							{/if}
						</td>
						<td>
							{#if row.status === "open"}
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
