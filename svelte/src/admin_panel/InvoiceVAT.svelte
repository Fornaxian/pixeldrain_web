<script lang="ts">
import { onMount } from "svelte";
import { formatDate } from "util/Formatting";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import Expandable from "util/Expandable.svelte";
import SortableTable, { FieldType } from "layout/SortableTable.svelte";
import { country_name, get_admin_invoices, type Invoice } from "lib/AdminAPI";
import PayPalVat from "./PayPalVAT.svelte";

let loading = true
let invoices: Invoice[] = []

let year = 0
let month = 0

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
const obj_to_list = (obj: {[id: string]: Total}) => {
	let list: ({id: string} & Total)[] = []
	for (const key in obj) {
		list.push({id: key, ...obj[key]})
	}
	return list
}

const eu_countries = [
	"AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
	"DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
	"PL", "PT", "RO", "SK", "SI", "ES", "SE",
]
const obj_to_list_eu = (obj: {[id: string]: Total}) => {
	let list: ({id: string} & Total)[] = []
	for (const key in obj) {
		if (eu_countries.includes(key)) {
			list.push({id: key, ...obj[key]})
		}
	}
	return list
}

const get_invoices = async () => {
	loading = true;
	try {
		const resp = await get_admin_invoices(year, month)

		resp.sort((a, b) => {
			if (a.status !== b.status) {
				return a.status.localeCompare(b.status)
			}

			const date_a = new Date(a.time)
			const date_b = new Date(b.time)
			return date_a.getTime() - date_b.getTime()
		})

		totals_provider = {}
		totals_country = {}
		resp.forEach(row => {
			if (row.status === "paid") {
				add_total(row)
			}
			if (row.status === "chargeback") {
				alert(row.vat)
			}
		});

		invoices = resp
		filter_invoices()
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

let status_filter = {
	canceled: {checked: false},
	expired: {checked: false},
	open: {checked: false},
	paid: {checked: true},
}
let gateway_filter = {}
let method_filter = {}

const filter_invoices = () => {
	records_hidden = 0
	invoices_filtered = invoices.filter(inv => {
		if (status_filter[inv.status] === undefined) {
			status_filter[inv.status] = {checked: true}
		}
		if (gateway_filter[inv.payment_gateway] === undefined) {
			gateway_filter[inv.payment_gateway] = {checked: true}
		}
		if (method_filter[inv.payment_method] === undefined) {
			method_filter[inv.payment_method] = {checked: true}
		}

		if(
			status_filter[inv.status].checked === true &&
			gateway_filter[inv.payment_gateway].checked === true &&
			method_filter[inv.payment_method].checked === true
		) {
			return true
		}

		records_hidden++
		return false
	})
}
let records_hidden = 0
let invoices_filtered: Invoice[] = []
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h3>{year + "-" + ("00"+(month)).slice(-2)}</h3>
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

	<Expandable click_expand>
		<div slot="header" class="header">Per payment processor</div>
		<SortableTable
			index_field="id"
			rows={obj_to_list(totals_provider)}
			columns={[
				{field: "id", label: "Provider", type: FieldType.Text},
				{field: "count", label: "Count", type: FieldType.Number},
				{field: "amount", label: "Amount", type: FieldType.Euro},
				{field: "vat", label: "VAT", type: FieldType.Euro},
				{field: "fee", label: "Fee", type: FieldType.Euro},
			]}
			totals
		/>
	</Expandable>

	<Expandable click_expand>
		<div slot="header" class="header">Per country</div>
		<SortableTable
			index_field="id"
			rows={obj_to_list(totals_country)}
			columns={[
				{field: "id", label: "Country", type: FieldType.Func, func: val => country_name(val)},
				{field: "count", label: "Count", type: FieldType.Number},
				{field: "amount", label: "Amount", type: FieldType.Euro},
				{field: "vat", label: "VAT", type: FieldType.Euro},
				{field: "fee", label: "Fee", type: FieldType.Euro},
			]}
			totals
		/>
	</Expandable>

	<Expandable click_expand>
		<div slot="header" class="header">In European Union</div>
		<SortableTable
			index_field="id"
			rows={obj_to_list_eu(totals_country)}
			columns={[
				{field: "id", label: "Country", type: FieldType.Func, func: val => country_name(val)},
				{field: "count", label: "Count", type: FieldType.Number},
				{field: "amount", label: "Amount", type: FieldType.Euro},
				{field: "vat", label: "VAT", type: FieldType.Euro},
				{field: "fee", label: "Fee", type: FieldType.Euro},
			]}
			totals
		/>
	</Expandable>

	<Expandable click_expand>
		<div slot="header" class="header">PayPal VAT</div>
		<PayPalVat invoices={invoices}/>
	</Expandable>

	<h4>All invoices</h4>
	<div class="filters">
		<div class="filter">
			Status:<br/>
			{#each Object.keys(status_filter) as filter}
				<input
					type="checkbox"
					id="status_{filter}"
					bind:checked={status_filter[filter].checked}
					on:change={filter_invoices}>
				<label for="status_{filter}">{filter}</label>
				<br/>
			{/each}
		</div>
		<div class="filter">
			Gateways:<br/>
			{#each Object.keys(gateway_filter) as filter}
				<input
					type="checkbox"
					id="gateway_{filter}"
					bind:checked={gateway_filter[filter].checked}
					on:change={filter_invoices}>
				<label for="gateway_{filter}">{filter}</label>
				<br/>
			{/each}
		</div>
		<div class="filter">
			Methods:<br/>
			{#each Object.keys(method_filter) as filter}
				<input
					type="checkbox"
					id="method_{filter}"
					bind:checked={method_filter[filter].checked}
					on:change={filter_invoices}>
				<label for="method_{filter}">{filter}</label>
				<br/>
			{/each}
		</div>
	</div>

	<br/>
	Total: {invoices.length}
	Visible: {invoices.length-records_hidden}
	Hidden: {records_hidden}
</section>


<SortableTable
	index_field="id"
	sort_field="time"
	rows={invoices_filtered}
	columns={[
		{field: "time", label: "Time", type: FieldType.Func, func: val => formatDate(val)},
		{field: "id", label: "ID", type: FieldType.Text},
		{field: "amount", label: "Amount", type: FieldType.Euro},
		{field: "vat", label: "VAT", type: FieldType.Euro},
		{field: "processing_fee", label: "Fee", type: FieldType.Euro},
		{field: "country", label: "Country", type: FieldType.Func, func: val => country_name(val)},
		{field: "payment_gateway", label: "Gateway", type: FieldType.Text},
		{field: "payment_method", label: "Method", type: FieldType.Text},
		{field: "status", label: "Status", type: FieldType.Text},
	]}
	totals
/>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer { flex: 1 1 auto; }
.header {
	display: flex;
	height: 100%;
	align-items: center;
	padding-left: 0.5em;
}
.filters {
	display: flex;
	flex-direction: row;
	gap: 1em;
}
</style>
