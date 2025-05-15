<script lang="ts">
import { onMount } from "svelte";
import { formatDate } from "util/Formatting";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import Euro from "util/Euro.svelte";
import { get_endpoint } from "lib/PixeldrainAPI";

type Invoice = {
	id: string
	time: string
	amount: number
	vat: number
	processing_fee: number
	country: string
	payment_gateway: string
	payment_method: string
	status: string
}

let loading = true
let invoices: Invoice[] = []

let year = 0
let month = 0
let month_str = ""

type Total = {
	count: number
	amount: number
	vat: number
	fee: number
}
let totals_provider: { [id: string]: Total } = {}
let totals_country: { [id: string]: Total } = {}
const add_total = (i: Invoice) => {
	if (totals_provider[i.payment_method] === undefined) {
		totals_provider[i.payment_method] = {count: 0, amount: 0, vat: 0, fee: 0}
	}
	if (totals_country[i.country] === undefined) {
		totals_country[i.country] = {count: 0, amount: 0, vat: 0, fee: 0}
	}

	totals_provider[i.payment_method].count++
	totals_provider[i.payment_method].amount += i.amount
	totals_provider[i.payment_method].vat += i.vat
	totals_provider[i.payment_method].fee += i.processing_fee
	totals_country[i.country].count++
	totals_country[i.country].amount += i.amount
	totals_country[i.country].vat += i.vat
	totals_country[i.country].fee += i.processing_fee
}

const get_invoices = async () => {
	loading = true;
	month_str = year + "-" + ("00"+(month)).slice(-2)
	try {
		const resp = await fetch(get_endpoint()+"/admin/invoices/"+month_str);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}

		let resp_json = await resp.json() as Invoice[];

		resp_json.sort((a, b) => {
			if (a.status !== b.status) {
				return a.status.localeCompare(b.status)
			}

			const date_a = new Date(a.time)
			const date_b = new Date(b.time)
			return date_a.getTime() - date_b.getTime()
		})

		totals_provider = {}
		totals_country = {}
		resp_json.forEach(row => {
			if (row.status === "paid") {
				add_total(row)
			}
			if (row.status === "chargeback") {
				alert(row.vat)
			}
		});

		invoices = resp_json
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

const last_month = () => {
	month--
	if (month === 0) {
		month = 12
		year--
	}

	get_invoices()
}
const next_month = () => {
	month++
	if (month === 13) {
		month = 1
		year++
	}

	get_invoices()
}

onMount(() => {
	let now = new Date()
	year = now.getFullYear()
	month = now.getMonth()+1
	get_invoices()
})
</script>

<LoadingIndicator loading={loading}/>

<section>
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

	<h4>Invoices per payment processor</h4>
	<div class="table_scroll" style="text-align: initial;">
		<table>
			<thead>
				<tr>
					<td>Provider</td>
					<td>Count</td>
					<td>Amount</td>
					<td>VAT</td>
					<td>Fee</td>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries(totals_provider) as [key, tot]}
					<tr>
						<td>{key}</td>
						<td>{tot.count}</td>
						<td><Euro amount={tot.amount}/></td>
						<td><Euro amount={tot.vat}/></td>
						<td><Euro amount={tot.fee}/></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h4>Invoices per country</h4>
	<div class="table_scroll" style="text-align: initial;">
		<table>
			<thead>
				<tr>
					<td>Country</td>
					<td>Count</td>
					<td>Amount</td>
					<td>VAT</td>
					<td>Fee</td>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries(totals_country) as [key, tot]}
					<tr>
						<td>{key}</td>
						<td>{tot.count}</td>
						<td><Euro amount={tot.amount}/></td>
						<td><Euro amount={tot.vat}/></td>
						<td><Euro amount={tot.fee}/></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h4>All invoices</h4>
</section>

<div class="table_scroll" style="text-align: initial;">
	<table>
		<thead>
			<tr>
				<td>Time</td>
				<td>ID</td>
				<td>Amount</td>
				<td>VAT</td>
				<td>Fee</td>
				<td>Country</td>
				<td>Gateway</td>
				<td>Method</td>
				<td>Status</td>
			</tr>
		</thead>
		<tbody>
			{#each invoices as row (row.id)}
				<tr>
					<td>{formatDate(row.time)}</td>
					<td>{row.id}</td>
					<td><Euro amount={row.amount}/></td>
					<td><Euro amount={row.vat}/></td>
					<td><Euro amount={row.processing_fee}/></td>
					<td>{row.country}</td>
					<td>{row.payment_gateway}</td>
					<td>{row.payment_method}</td>
					<td>{row.status}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
</style>
