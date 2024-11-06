<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import { mollie_proxy_call } from "./MollieAPI.js";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import Euro from "../util/Euro.svelte";

export let settlement = {}
let loading = true
let response = {}
let payments = []

let per_country = {}
let totals = {
	count: 0,
	vat: 0,
	amount: 0,
}

const get_payments = async () => {
	loading = true;
	try {
		const req = await mollie_proxy_call("settlements/"+settlement.id+"/payments?limit=250")
		if(req.status >= 400) {
			throw new Error(req.text());
		}
		response = await req.json()
		payments = response._embedded.payments

		payments.forEach(row => {
			if (!per_country[row.metadata.country]) {
				per_country[row.metadata.country] = {
					vat: 0,
					amount: 0,
					count: 0,
					vat_fraction: row.metadata.vat_fraction,
				}
			}
			per_country[row.metadata.country].vat += row.metadata.vat
			per_country[row.metadata.country].amount += row.metadata.amount
			per_country[row.metadata.country].count++

			totals.vat += row.metadata.vat
			totals.amount += row.metadata.amount
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

		console.log(per_country)
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

onMount(get_payments);
</script>

<LoadingIndicator loading={loading}/>

<h3>Accounting information</h3>

{#if per_country.NL}
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
				<td>8030 - Omzet Mollie inkomsten</td>
			</tr>
			<tr>
				<td><Euro amount={totals.vat-per_country.NL.vat}/></td>
				<td>Geen BTW</td>
				<td><Euro amount={0}/></td>
				<td>1651 - BTW OSS</td>
			</tr>
			<tr>
				<td><Euro amount={(settlement.amount.value*1e6)-totals.vat-per_country.NL.amount}/></td>
				<td>Geen BTW</td>
				<td><Euro amount={0}/></td>
				<td>8030 - Omzet Mollie inkomsten</td>
			</tr>
		</tbody>
	</table>
{/if}


<h3>Taxes per country</h3>

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
				</tr>
			{/each}

			<tr>
				<td>Total</td>
				<td>{totals.count}</td>
				<td><Euro amount={totals.amount}/></td>
				<td><Euro amount={totals.vat}/></td>
				<td></td>
				<td><Euro amount={totals.vat+totals.amount}/></td>
			</tr>
			{#if per_country.NL}
				<tr>
					<td>Total - NL</td>
					<td>{totals.count - per_country.NL.count}</td>
					<td><Euro amount={totals.amount-per_country.NL.amount}/></td>
					<td><Euro amount={totals.vat-per_country.NL.vat}/></td>
					<td></td>
					<td><Euro amount={(totals.vat-per_country.NL.vat)+(totals.amount-per_country.NL.amount)}/></td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<h3>All payments ({payments.length})</h3>
<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td>ID</td>
				<td>Created</td>
				<td>Status</td>
				<td>Country</td>
				<td>Amount</td>
				<td>VAT</td>
				<td>Total</td>
			</tr>
		</thead>
		<tbody>
			{#each payments as row (row.id)}
				<tr>
					<td><a href={row._links.dashboard.href} target="_blank">{row.id}</a></td>
					<td>{formatDate(row.createdAt, true, true, false)}</td>
					<td>{row.status}</td>
					<td>{row.metadata.country}</td>
					<td><Euro amount={row.metadata.amount}/></td>
					<td><Euro amount={row.metadata.vat}/></td>
					<td><Euro amount={row.amount.value*1e6}/></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
