<script lang="ts">
import { country_name, type Invoice } from "lib/AdminAPI";
import Euro from "util/Euro.svelte";

export let invoices: Invoice[] = []

type Country = {
	vat: number,
	amount: number,
	fee: number,
	count: number,
	vat_fraction: number,
}

let totals: {
	count: number,
	vat: number,
	amount: number,
	fee: number,
}

$: per_country = update_countries(invoices)

const update_countries = (invoices: Invoice[]) => {
	let per_country: {[id: string]: Country} = {
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

	invoices.forEach(row => {
		if (row.status !== "paid" || row.payment_method !== "paypal") {
			return
		}
		if (!per_country[row.country]) {
			per_country[row.country] = {
				vat: 0,
				amount: 0,
				fee: 0,
				count: 0,
				vat_fraction: row.vat/row.amount,
			}
		}
		per_country[row.country].vat += row.vat
		per_country[row.country].amount += row.amount
		per_country[row.country].fee += row.processing_fee
		per_country[row.country].count++
		totals.vat += row.vat
		totals.amount += row.amount
		totals.fee += row.processing_fee
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

	return per_country
}
</script>

<section>
	{#if per_country["NL"] && totals}
		<h2>Summary</h2>
		<table style="width: auto;">
			<tr>
				<td>Total PayPal earnings -fees</td>
				<td><Euro amount={totals.vat+totals.amount-totals.fee}/></td>
			</tr>
			<tr>
				<td>Total VAT NL</td>
				<td><Euro amount={per_country["NL"].vat}/></td>
			</tr>
			<tr>
				<td>Total VAT OSS</td>
				<td><Euro amount={totals.vat-per_country["NL"].vat}/></td>
			</tr>
		</table>

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
					<td><Euro amount={per_country["NL"].amount + per_country["NL"].vat}/></td>
					<td>BTW hoog 21%</td>
					<td><Euro amount={per_country["NL"].vat}/></td>
					<td>8040 - Omzet PayPal inkomsten</td>
				</tr>
				<tr>
					<td><Euro amount={totals.amount-totals.fee-per_country["NL"].amount}/></td>
					<td>Geen BTW</td>
					<td><Euro amount={0}/></td>
					<td>8040 - Omzet PayPal inkomsten</td>
				</tr>
				<tr>
					<td><Euro amount={totals.vat-per_country["NL"].vat}/></td>
					<td>Geen BTW</td>
					<td><Euro amount={0}/></td>
					<td>1651 - BTW OSS</td>
				</tr>
			</tbody>
		</table>

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
						{#if row.vat > 0}
							<tr>
								<td>{country_name(country)}</td>
								<td>{row.count}</td>
								<td><Euro amount={row.amount}/></td>
								<td><Euro amount={row.vat}/></td>
								<td>{row.vat_fraction*100}%</td>
								<td><Euro amount={row.vat+row.amount}/></td>
								<td><Euro amount={-row.fee}/></td>
								<td><Euro amount={row.vat+row.amount-row.fee}/></td>
							</tr>
						{/if}
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
					{#if per_country["NL"]}
						<tr>
							<td>Total ex NL</td>
							<td>{totals.count - per_country["NL"].count}</td>
							<td><Euro amount={totals.amount-per_country["NL"].amount}/></td>
							<td><Euro amount={totals.vat-per_country["NL"].vat}/></td>
							<td></td>
							<td><Euro amount={(totals.vat-per_country["NL"].vat)+(totals.amount-per_country["NL"].amount)}/></td>
							<td><Euro amount={-(totals.fee-per_country["NL"].fee)}/></td>
							<td><Euro amount={(totals.vat-per_country["NL"].vat)+(totals.amount-per_country["NL"].amount)-(totals.fee-per_country["NL"].fee)}/></td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</section>
