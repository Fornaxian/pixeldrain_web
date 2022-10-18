<script>
import { onMount } from "svelte";
import Euro from "../util/Euro.svelte";
import { formatDate } from "../util/Formatting.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";

let loading = false
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
</section>
