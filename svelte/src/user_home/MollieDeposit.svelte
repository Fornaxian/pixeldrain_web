<script>
import Euro from '../util/Euro.svelte';
import LoadingIndicator from '../util/LoadingIndicator.svelte';

let loading = false
let amount = 20
let country = null

$: credit_micro = amount*1e6
$: vat_micro = country === null ? 0 : (amount*1e6)*(country.vat/100)

let countries = [
	{name: "Austria", flag: "🇦🇹", vat: 20},
	{name: "Belgium", flag: "🇧🇪", vat: 21},
	{name: "Bulgaria", flag: "🇧🇬", vat: 20},
	{name: "Croatia", flag: "🇭🇷", vat: 25},
	{name: "Cyprus", flag: "🇨🇾", vat: 19},
	{name: "Czechia", flag: "🇨🇿", vat: 21},
	{name: "Denmark", flag: "🇩🇰", vat: 25},
	{name: "Estonia", flag: "🇪🇪", vat: 20},
	{name: "Finland", flag: "🇫🇮", vat: 24},
	{name: "France", flag: "🇫🇷", vat: 20},
	{name: "Germany", flag: "🇩🇪", vat: 19},
	{name: "Greece", flag: "🇬🇷", vat: 24},
	{name: "Hungary", flag: "🇭🇺", vat: 27},
	{name: "Ireland", flag: "🇮🇪", vat: 23},
	{name: "Italy", flag: "🇮🇹", vat: 22},
	{name: "Latvia", flag: "🇱🇻", vat: 21},
	{name: "Lithuania", flag: "🇱🇹", vat: 21},
	{name: "Luxembourg", flag: "🇱🇺", vat: 16},
	{name: "Malta", flag: "🇲🇹", vat: 18},
	{name: "Netherlands", flag: "🇳🇱", vat: 21},
	{name: "Poland", flag: "🇵🇱", vat: 23},
	{name: "Portugal", flag: "🇵🇹", vat: 23},
	{name: "Romania", flag: "🇷🇴", vat: 19},
	{name: "Slovakia", flag: "🇸🇰", vat: 20},
	{name: "Slovenia", flag: "🇸🇮", vat: 22},
	{name: "Spain", flag: "🇪🇸", vat: 21},
	{name: "Sweden", flag: "🇸🇪", vat: 25},
	{name: "Other", flag: "🌐", vat: 0},
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

		<div>
			Please pick your country of residence
		</div>
		<div class="countries">
			{#each countries as c}
				<button on:click={() => country = c}>
					<span style="font-size: 1.7em; line-height: 0.9em;">{c.flag}</span>
					<span>{c.name}</span>
				</button>
			{/each}
		</div>
		<div>
			We support the following payment processors
		</div>
		<div class="processors">
			<div>
				<img class="bankicon" src="/res/img/payment_providers/paypal.svg" alt="PayPal" title="PayPal"/>
				PayPal
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/ideal.svg" alt="iDEAL" title="iDEAL"/>
				iDEAL
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/klarna.svg" alt="Klarna" title="Klarna"/>
				Klarna
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/bancontact.svg" alt="Bancontact" title="Bancontact"/>
				Bancontact
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/banktransfer.svg" alt="SEPA" title="SEPA"/>
				SEPA
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/sofort.svg" alt="SOFORT" title="SOFORT"/>
				SOFORT
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/kbc.svg" alt="KBC/CBC" title="CBC"/>
				KBC/CBC
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/belfius.svg" alt="Belfius" title="Belfius"/>
				Belfius
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/giropay.svg" alt="Giropay" title="Giropay"/>
				Giropay
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/eps.svg" alt="EPS" title="EPS"/>
				EPS
			</div>
			<div>
				<img class="bankicon" src="/res/img/payment_providers/przelewy24.svg" alt="Przelewy24" title="Przelewy24"/>
				Przelewy24
			</div>
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
				<span style="font-size: 1.5em; line-height: 1em;">{country.flag}</span>
				<span>{country.name} ({country.vat}% VAT)</span>
			</div>
		</div>

		<form class="amount_grid" on:submit|preventDefault={checkout}>
			<div class="span3">Please choose an amount</div>
			{#each amounts as a}
				<button
					on:click|preventDefault={() => amount = a}
					class="amount_button"
					class:button_highlight={amount === a}
				>
					€ {a}
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
	grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}
.countries > button {
	display: flex;
	flex-direction: row;
	text-align: left;
	gap: 5px;
}

.processors {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}
.processors > div {
	display: flex;
	align-items: center;
	gap: 5px;
	margin: 3px;
}

.amount_grid {
	max-width: 500px;
	gap: 4px;
	display: inline-grid;
	align-items: center;
	grid-template-columns: 1fr 1fr 1fr;
}
.amount_button {
	font-size: 1.1em;
	line-height: 1.6em;
	justify-content: center;
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
