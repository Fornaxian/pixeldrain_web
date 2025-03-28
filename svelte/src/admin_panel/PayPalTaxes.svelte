<script>
import { onMount } from "svelte";
import { formatDate } from "util/Formatting";
import Expandable from "util/Expandable.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import Euro from "util/Euro.svelte";

let loading = true
let response = {}
let payments = []

let per_country = {}
let totals = {}

let datePicker
let rangeMonths = 1
let startDate = 0
let endDate = 0

const get_payments = async () => {
	if (!datePicker.valueAsDate) {
		datePicker.valueAsDate = new Date()
	}
	startDate = Date.UTC(datePicker.valueAsDate.getUTCFullYear(), datePicker.valueAsDate.getUTCMonth())
	endDate = Date.UTC(datePicker.valueAsDate.getUTCFullYear(), datePicker.valueAsDate.getUTCMonth()+rangeMonths)

	per_country = {
		NL: {
			vat: 0,
			amount: 0,
			fee: 0,
			count: 0,
			vat_fraction: .21,
		}
	}
	totals = {
		count: 0,
		vat: 0,
		amount: 0,
		fee: 0,
	}
	payments = []
	loading = true;

	try {
		await get_page("https://api.mollie.com/v2/payments?limit=250")

		payments.forEach(row => {
			if (!per_country[row.metadata.country]) {
				per_country[row.metadata.country] = {
					vat: 0,
					amount: 0,
					fee: 0,
					count: 0,
					vat_fraction: row.metadata.vat_fraction,
				}
			}
			per_country[row.metadata.country].vat += row.metadata.vat
			per_country[row.metadata.country].amount += row.metadata.amount
			per_country[row.metadata.country].fee += Math.trunc(parseFloat(row.details.paypalFee.value)*1e6)
			per_country[row.metadata.country].count++
			totals.vat += row.metadata.vat
			totals.amount += row.metadata.amount
			totals.fee += Math.trunc(parseFloat(row.details.paypalFee.value)*1e6)
			totals.count++
		})

		// Sort the countries. Don't ask me how it works
		per_country = Object.keys(per_country).sort().reduce(
			(obj, key) => {
				obj[key] = per_country[key]
				return obj
			},
			{}
		)
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
}

const get_page = async (url) => {
	let req = await fetch(window.api_endpoint + "/admin/mollie_request?endpoint=" + encodeURIComponent(url));
	if(req.status >= 400) {
		throw new Error(req.text());
	}
	response = await req.json()

	let added = 0

	response._embedded.payments.forEach(v => {
		if (
			v.method === "paypal" &&
			v.status === "paid" &&
			(new Date(v.createdAt)) > startDate &&
			(new Date(v.createdAt)) < endDate &&
			(v.amountRefunded === undefined || v.amountRefunded.value === "0.00") &&
			(v.amountChargedBack === undefined || v.amountChargedBack.value === "0.00")
		) {
			payments.push(v)
			added++
		}
	})

	payments = payments

	let lastDate = new Date(response._embedded.payments[response._embedded.payments.length-1].createdAt)
	console.log("last payment date", lastDate)
	console.log("start date", new Date(startDate))
	if (lastDate > startDate && response._embedded.payments.length !== 0) {
		await get_page(response._links.next.href)
	}
};

onMount(() => {
	get_payments()
});
</script>

<LoadingIndicator loading={loading}/>

<section>
	<div class="toolbar" style="text-align: left;">
		<div>Payments: {payments.length}</div>
		<div class="toolbar_spacer"></div>
		<div>Range</div>
		<input type="date" bind:this={datePicker}/>
		<div>Months</div>
		<input type="number" bind:value={rangeMonths}/>
		<button on:click={get_payments}>Go</button>
	</div>

	<div>
		Showing payments from {formatDate(startDate)} to {formatDate(endDate)}
	</div>
	<hr/>


	{#if per_country.NL}
		<h2>Accounting information</h2>
		<table>
			<thead>
				<tr>
					<td>Bedrag</td>
					<td>BTW-code</td>
					<td>BTW</td>
					<td>Tegenrekening</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><Euro amount={per_country.NL.amount + per_country.NL.vat}/></td>
					<td>BTW hoog 21%</td>
					<td><Euro amount={per_country.NL.vat}/></td>
					<td>8040 - Omzet PayPal inkomsten</td>
				</tr>
				<tr>
					<td><Euro amount={totals.vat-per_country.NL.vat}/></td>
					<td>Geen BTW</td>
					<td><Euro amount={0}/></td>
					<td>1651 - BTW OSS</td>
				</tr>
				<tr>
					<td><Euro amount={totals.amount-totals.fee-per_country.NL.amount}/></td>
					<td>Geen BTW</td>
					<td><Euro amount={0}/></td>
					<td>8040 - Omzet PayPal inkomsten</td>
				</tr>
			</tbody>
		</table>
	{/if}

	<h2>Taxes per country</h2>

	<div class="table_scroll">
		<table>
			<thead>
				<tr>
					<td>Country</td>
					<td>Payments</td>
					<td>Amount</td>
					<td>VAT</td>
					<td>VAT%</td>
					<td>Total</td>
					<td>Fee</td>
					<td>Total</td>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries(per_country) as [country, row]}
					<tr>
						<td>{country}</td>
						<td>{row.count}</td>
						<td><Euro amount={row.amount}/></td>
						<td><Euro amount={row.vat}/></td>
						<td>{row.vat_fraction*100}%</td>
						<td><Euro amount={row.vat+row.amount}/></td>
						<td><Euro amount={-row.fee}/></td>
						<td><Euro amount={row.vat+row.amount-row.fee}/></td>
					</tr>
				{/each}

				<tr>
					<td>Total</td>
					<td>{totals.count}</td>
					<td><Euro amount={totals.amount}/></td>
					<td><Euro amount={totals.vat}/></td>
					<td></td>
					<td><Euro amount={totals.vat+totals.amount}/></td>
					<td><Euro amount={-totals.fee}/></td>
					<td><Euro amount={(totals.vat+totals.amount)-totals.fee}/></td>
				</tr>
				{#if per_country.NL}
					<tr>
						<td>Total ex NL</td>
						<td>{totals.count - per_country.NL.count}</td>
						<td><Euro amount={totals.amount-per_country.NL.amount}/></td>
						<td><Euro amount={totals.vat-per_country.NL.vat}/></td>
						<td></td>
						<td><Euro amount={(totals.vat-per_country.NL.vat)+(totals.amount-per_country.NL.amount)}/></td>
						<td><Euro amount={-(totals.fee-per_country.NL.fee)}/></td>
						<td><Euro amount={(totals.vat-per_country.NL.vat)+(totals.amount-per_country.NL.amount)-(totals.fee-per_country.NL.fee)}/></td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<h2>Payments</h2>
	{#each payments as row (row.id)}
		<Expandable click_expand>
			<div slot="header" class="header">
				<div class="title">{row.id}</div>
				<div class="stats">
					Date<br/>
					{formatDate(row.createdAt, false, false, false)}
				</div>
				<div class="stats">
					Total<br/>
					<Euro amount={row.amount.value*1e6}/>
				</div>
				<div class="stats">
					Amount<br/>
					<Euro amount={row.metadata.amount}/>
				</div>
				<div class="stats">
					VAT<br/>
					<Euro amount={row.metadata.vat}/>
				</div>
				<div class="stats">
					Status<br/>
					{row.status}
				</div>
			</div>
			<div>
				Amount: <Euro amount={row.metadata.amount} /><br/>
				VAT: <Euro amount={row.metadata.vat} /><br/>
				Country: {row.metadata.country}<br/>
				User: {row.metadata.user_id}<br/>
			</div>
		</Expandable>
	{/each}
</section>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	align-items: center;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
.toolbar > input[type="number"] {
	width: 4em;
	max-width: 5em;
	min-width: 1em;
}

.header {
	display: flex;
	flex-direction: row;
	line-height: 1.2em;
}
.title {
	flex: 1 1 auto;
	align-self: center;
	word-break: break-all;
	padding-left: 8px;
}
.stats {
	flex: 0 0 auto;
	padding: 0 4px;
	border-left: 1px solid var(--separator);
	text-align: center;
}
</style>
