<script>
import {
	At, Be, Bg, Hr, Cy, Cz, Dk, Ee, Fi, Fr, De, Gr, Hu, Ie, It, Lv, Lt, Lu, Mt,
	Nl, Pl, Pt, Ro, Sk, Si, Es, Se,
} from 'svelte-flag-icons';
import Euro from '../util/Euro.svelte';
import LoadingIndicator from '../util/LoadingIndicator.svelte';

let loading = false
let amount = 20
let country = null

$: credit_micro = amount*1e6
$: vat_micro = country === null ? 0 : (amount*1e6)*(country.vat/100)

let countries = [
	{name: "Austria", code: At, vat: 20},
	{name: "Belgium", code: Be, vat: 21},
	{name: "Bulgaria", code: Bg, vat: 20},
	{name: "Croatia", code: Hr, vat: 25},
	{name: "Cyprus", code: Cy, vat: 19},
	{name: "Czechia", code: Cz, vat: 21},
	{name: "Denmark", code: Dk, vat: 25},
	{name: "Estonia", code: Ee, vat: 20},
	{name: "Finland", code: Fi, vat: 24},
	{name: "France", code: Fr, vat: 20},
	{name: "Germany", code: De, vat: 19},
	{name: "Greece", code: Gr, vat: 24},
	{name: "Hungary", code: Hu, vat: 27},
	{name: "Ireland", code: Ie, vat: 23},
	{name: "Italy", code: It, vat: 22},
	{name: "Latvia", code: Lv, vat: 21},
	{name: "Lithuania", code: Lt, vat: 21},
	{name: "Luxembourg", code: Lu, vat: 16},
	{name: "Malta", code: Mt, vat: 18},
	{name: "Netherlands", code: Nl, vat: 21},
	{name: "Poland", code: Pl, vat: 23},
	{name: "Portugal", code: Pt, vat: 23},
	{name: "Romania", code: Ro, vat: 19},
	{name: "Slovakia", code: Sk, vat: 20},
	{name: "Slovenia", code: Si, vat: 22},
	{name: "Spain", code: Es, vat: 21},
	{name: "Sweden", code: Se, vat: 25},
]

let amounts = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000]

const checkout = async () => {
	loading = true

	if (amount < 10) {
		alert("Amount needs to be at least €10")
		return
	}

	const form = new FormData()
	form.set("amount", amount*1e6)
	form.set("network", "mollie")
	form.set("country", country.name)

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

</script>

<div class="highlight_border">
	<LoadingIndicator loading={loading}/>

	{#if country === null}

		<div>Please pick your country of residence</div>
		<div class="countries">
			{#each countries as c}
				<button on:click={() => country = c}>
					{#if c.code}
						<svelte:component this={c.code} size="1.5em" />
					{:else}
						<i class="icon">public</i>
					{/if}
					<span>{c.name}</span>
				</button>
			{/each}
		</div>
		<div>
			We support the following payment processors<br/>
			<img class="bankicon" src="/res/img/payment_providers/ideal.svg" alt="iDEAL" title="iDEAL"/>
			<img class="bankicon" src="/res/img/payment_providers/klarna.svg" alt="Klarna" title="Klarna"/>
			<img class="bankicon" src="/res/img/payment_providers/bancontact.svg" alt="Bancontact" title="Bancontact"/>
			<img class="bankicon" src="/res/img/payment_providers/banktransfer.svg" alt="SEPA" title="SEPA"/>
			<img class="bankicon" src="/res/img/payment_providers/sofort.svg" alt="SOFORT" title="SOFORT"/>
			<img class="bankicon" src="/res/img/payment_providers/kbc.svg" alt="KBC/CBC" title="CBC"/>
			<img class="bankicon" src="/res/img/payment_providers/belfius.svg" alt="Belfius" title="Belfius"/>
			<img class="bankicon" src="/res/img/payment_providers/giropay.svg" alt="Giropay" title="Giropay"/>
			<img class="bankicon" src="/res/img/payment_providers/eps.svg" alt="EPS" title="EPS"/>
			<img class="bankicon" src="/res/img/payment_providers/przelewy24.svg" alt="Przelewy24" title="Przelewy24"/>
		</div>

	{:else}

		<div style="display: flex;">
			<button on:click={() => country = null} style="flex: 0 0 auto;">
				<i class="icon">chevron_left</i>
				Back
			</button>
			<div style="flex: 1 1 auto;"></div>
			<div style="flex: 0 0 auto; display: flex; gap: 0.25em; align-items: center;">
				<span>Paying from</span>
				{#if country.code}
					<svelte:component this={country.code} size="1.5em" />
				{:else}
					<i class="icon">public</i>
				{/if}
				<span>{country.name} ({country.vat}% VAT)</span>
			</div>
		</div>

		<form class="amount_grid" on:submit|preventDefault={checkout}>
			<div class="span3">Please choose an amount</div>
			{#each amounts as a}
				<button on:click|preventDefault={() => amount = a} style="font-size: 1.1em;" class:button_highlight={amount === a}>
					<div style="padding: 6px;">€ {a}</div>
				</button>
			{/each}

			<div class="span3 mollie_checkout">
				<div>Custom amount €</div>
				<input type="number" bind:value={amount} min="10"/>
			</div>

			<div class="span2" style="text-align: initial;">
				Total including VAT:
				<Euro amount={credit_micro + vat_micro}/>
			</div>

			<button type="submit" class="button_highlight">
				<i class="icon">paid</i> Checkout
			</button>
		</form>
	{/if}
</div>

<style>
.countries {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
.countries > button {
	display: flex;
	flex-direction: row;
	text-align: left;
}
.countries > button > span {
	margin-left: 0.5em;
}

.amount_grid {
	max-width: 500px;
	gap: 4px;
	display: inline-grid;
	align-items: center;
	grid-template-columns: 1fr 1fr 1fr;
}

.span2 {
	grid-column: span 2;
}
.span3 {
	grid-column: span 3;
}

.mollie_checkout {
	display: flex;
	flex-direction: row;
}
.mollie_checkout > div {
	display: flex;
	flex: 0 0 auto;
	align-items: center;
}
.mollie_checkout > input[type="number"] {
	flex: 1 1 auto;
}

.bankicon {
	width: 40px;
	height: 30px;
}
</style>
