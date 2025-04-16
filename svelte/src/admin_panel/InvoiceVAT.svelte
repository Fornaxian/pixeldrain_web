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
	country: string
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
}
let totals: { [id: string]: Total } = {}
const add_total = (i: Invoice) => {
	if (totals[i.payment_method] === undefined) {
		totals[i.payment_method] = {count: 0, amount: 0, vat: 0}
	}

	totals[i.payment_method].count++
	totals[i.payment_method].amount += i.amount
	totals[i.payment_method].vat += i.vat
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

		totals = {}
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

	{#each Object.entries(totals) as [key, tot]}
		{key} ({tot.count})<br/>
		Amount:<Euro amount={tot.amount}/><br/>
		VAT: <Euro amount={tot.vat}/><br/>
	{/each}

	<div class="table_scroll">
		<table>
			<thead>
				<tr>
					<td>Time</td>
					<td>Amount</td>
					<td>VAT</td>
					<td>Country</td>
					<td>Method</td>
					<td>Status</td>
				</tr>
			</thead>
			<tbody>
				{#each invoices as row (row.id)}
					<tr>
						<td>{formatDate(row.time)}</td>
						<td><Euro amount={row.amount}/></td>
						<td><Euro amount={row.vat}/></td>
						<td>{row.country}</td>
						<td>{row.payment_method}</td>
						<td>{row.status}</td>
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
