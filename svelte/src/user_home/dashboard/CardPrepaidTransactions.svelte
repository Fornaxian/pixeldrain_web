<script>
import { onMount } from "svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte";
import Euro from "../../util/Euro.svelte"
import LoadingIndicator from "../../util/LoadingIndicator.svelte";
import Button from "../../layout/Button.svelte";

let loading = false

let year = 0
let month = 0
let month_str = ""
let transactions = {
	rows: [],
	total_subscription_charge: 0,
	total_storage_used: 0,
	total_storage_charge: 0,
	total_bandwidth_used: 0,
	total_bandwidth_charge: 0,
	total_deposited: 0,
	total_deducted: 0,
}

const load_transactions = async () => {
	loading = true
	month_str = year + "-" + ("00"+(month)).slice(-2)
	try {
		const resp = await fetch(window.api_endpoint+"/user/transactions/"+month_str)
		if(resp.status >= 400) {
			let json = await resp.json()
			if (json.value === "authentication_failed") {
				window.location = "/login"
				return
			} else {
				throw new Error(json.message)
			}
		}

		let month = {
			rows: await resp.json(),
			total_subscription_charge: 0,
			total_storage_used: 0,
			total_storage_charge: 0,
			total_bandwidth_used: 0,
			total_bandwidth_charge: 0,
			total_deposited: 0,
			total_deducted: 0,
		}

		month.rows.forEach(row => {
			row.time = new Date(row.time)
			month.total_deposited += row.deposit_amount
			month.total_subscription_charge += row.subscription_charge
			month.total_storage_used += row.storage_used
			month.total_storage_charge += row.storage_charge
			month.total_bandwidth_used += row.bandwidth_used
			month.total_bandwidth_charge += row.bandwidth_charge
			month.total_deducted += row.subscription_charge + row.storage_charge + row.bandwidth_charge
		})

		// Divide the total storage usage by the number of days in a month
		month.total_storage_used /= 30.4375

		transactions = month
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
};
const last_month = () => {
	month--
	if (month === 0) {
		month = 12
		year--
	}

	load_transactions()
}
const next_month = () => {
	month++
	if (month === 13) {
		month = 1
		year++
	}

	load_transactions()
}

onMount(() => {
	let now = new Date()
	year = now.getFullYear()
	month = now.getMonth()+1
	load_transactions()
})
</script>

<LoadingIndicator loading={loading}/>

<div class="toolbar">
	<Button click={last_month} icon="chevron_left"/>
	<div class="toolbar_spacer">
		{month_str}
	</div>
	<Button click={next_month} icon="chevron_right"/>
</div>

<ul>
	<li>
		Total charge: <Euro amount={transactions.total_deducted} precision="4"/>
	</li>
	<li>
		Subscription charge: <Euro amount={transactions.total_subscription_charge} precision="4"/>
	</li>
	<li>
		Storage charge: <Euro amount={transactions.total_storage_charge} precision="4"/>
		(used {formatDataVolume(transactions.total_storage_used, 3)})
	</li>
	<li>
		Bandwidth charge: <Euro amount={transactions.total_bandwidth_charge} precision="4"/>
		(used {formatDataVolume(transactions.total_bandwidth_used, 3)})
	</li>
	<li>
		Deposited: <Euro amount={transactions.total_deposited} precision="4"/>
	</li>
</ul>

<style>
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	margin-top: 4px;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer {
	flex: 1 1 auto;
	text-align: center;
	align-content: center;
	font-size: 1.2em;
}
</style>
