<script lang="ts">
import { onMount } from "svelte";
import Euro from "util/Euro.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import { countries } from "country-data-list";
import { get_endpoint, get_misc_vat_rate } from "lib/PixeldrainAPI";
import CreditDepositNav from "./CreditDepositNav.svelte";

let loading = false
let amount = 20
let country: typeof countries.all[0] = null
let country_input = ""
let provider: PaymentProvider = null
let vat = 0

const amounts = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000]

onMount(() => {
	const checkout_country = window.localStorage.getItem("checkout_country")
	if (countries[checkout_country] !== undefined) {
		country_input = checkout_country
		set_country()
	}

	const checkout_provider = window.localStorage.getItem("checkout_provider")
	for (const p of providers) {
		if (p.name === checkout_provider) {
			set_provider(p)
			break
		}
	}
})

type PaymentProvider = {
	icon: string,
	name: string,
	label: string,
	crypto?: boolean,
};
const providers: PaymentProvider[] = [
	{icon: "paypal_full", name: "paypal", label: "PayPal"},
	{icon: "mollie", name: "mollie", label: "Mollie"},
	{icon: "bitcoin", name: "btc", label: "Bitcoin", crypto: true},
	{icon: "dogecoin", name: "doge", label: "Dogecoin", crypto: true},
	{icon: "monero", name: "xmr", label: "Monero", crypto: true},
]

const payment_providers = [
	{icon: "paypal", name: "PayPal"},
	{icon: "creditcard", name: "Credit/debit"},
	{icon: "apple_pay", name: "Apple Pay"},
	{icon: "google_pay", name: "Google Pay"},
	{icon: "bancomat", name: "Bancomat"},
	{icon: "bancontact", name: "Bancontact"},
	{icon: "belfius", name: "Belfius"},
	{icon: "blik", name: "Blik"},
	{icon: "eps", name: "EPS"},
	{icon: "ideal", name: "iDEAL"},
	{icon: "ideal_in3", name: "iDeal in3"},
	{icon: "kbc", name: "KBC"},
	{icon: "mb_way", name: "MB Way"},
	{icon: "multibanco", name: "Multibanco"},
	{icon: "p24", name: "Przelewy24"},
	{icon: "riverty", name: "Riverty"},
	{icon: "satispay", name: "Satispay"},
	{icon: "sepa", name: "SEPA Transfer"},
	{icon: "twint", name: "Twint"},
]

const set_country = async (e?: Event) => {
	loading = true
	if (e !== undefined) {
		e.preventDefault()
	}

	if (countries[country_input] === undefined) {
		alert("Please enter a valid country code")
		return
	}
	const c = countries[country_input]

	// Cache the value for next checkout
	window.localStorage.setItem("checkout_country", c.alpha3)

	try {
		const vat_rate = await get_misc_vat_rate(c.alpha3)
		vat = vat_rate.vat*100
		country = c
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
}

const set_provider = (p: PaymentProvider) => {
	provider = p

	// Cache the value for next checkout
	window.localStorage.setItem("checkout_provider", p.name)
}

const checkout = async () => {
	loading = true

	if (amount < 10) {
		alert("Amount needs to be at least €10")
		return
	}

	const form = new FormData()
	form.set("amount", String(amount*1e6))
	form.set("network", provider.name)
	form.set("country", country.alpha2)

	try {
		const resp = await fetch(
			get_endpoint()+"/user/invoice",
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

const format_country = (c: typeof countries.all[0]) => {
	let str = ""
	if (c.emoji !== undefined) {
		str += c.emoji + " "
	} else {
		str += "🌐 "
	}
	str += c.name+" "
	str += "("+c.alpha2+", "
	str += c.alpha3+")"
	return str
}
</script>

<div class="highlight_border">
	<LoadingIndicator loading={loading}/>

	{#if country === null}

		<div>
			Please pick your country of residence
		</div>
		<div>
			<form on:submit|preventDefault={set_country} class="country_form">
				<div class="country_search">
					<datalist id="country_picker">
						{#each countries.all.filter(c => c.status === "assigned") as c}
							<option value={c.alpha2}>{format_country(c)}</option>
						{/each}
					</datalist>
					<input
						bind:value={country_input}
						type="text"
						list="country_picker"
						placeholder="Search for country"
						style="flex: 1 1 auto;">
					<button type="submit" class="button_highlight" style="flex: 0 0 auto;">
						<i class="icon">send</i>
						Continue
					</button>
				</div>
				<select bind:value={country_input} on:dblclick={set_country} style="padding: 0;" size="10">
					{#each countries.all.filter(c => c.status === "assigned") as c}
						<option value={c.alpha2}>{format_country(c)}</option>
					{/each}
				</select>
			</form>
		</div>
		<hr/>
		<div>
			We support the following payment processors
		</div>
		<div class="processors">
			{#each payment_providers as p (p.name)}
				<div>
					<img class="bankicon" src="/res/img/payment_providers/{p.icon}.svg" alt={p.name} title={p.name}/>
					{p.name}
				</div>
			{/each}
		</div>

	{:else if provider === null}
		<CreditDepositNav bind:country={country} bind:provider={provider} bind:vat={vat}/>

		<h2>Please select a payment provider</h2>

		<div class="providers">
			{#each providers as p (p.name)}
				<button on:click={() => set_provider(p)}>
					<img src="/res/img/payment_providers/{p.icon}.svg" alt={p.label} title={p.label}/>
					{p.label}
				</button>
			{/each}
		</div>

	{:else}
		<CreditDepositNav bind:country={country} bind:provider={provider} bind:vat={vat}/>

		{#if provider.crypto === true}
			<p style="text-align: initial;" class="highlight_blue">
				When paying with cryptocurrencies it is important that you pay the
				<b>exact amount</b> stated on the order. If you pay too little, the
				order fails. If you pay too much then the remaining credit will not
				be added to your account. Pay close attention when sending a payment
				from an online exchange, sometimes they will subtract the fees from
				the amount sent which will cause the payment to fail.
			</p>
		{/if}

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
				<Euro amount={(amount*1e6) + (amount*1e6)*(vat/100)}/>
			</div>

			<button type="submit" class="button_highlight">
				<i class="icon">paid</i> Checkout
			</button>
		</form>
		<hr/>
		<p style="text-align: initial;">
			This Pixeldrain premium plan costs €1 per month, but due to
			processing fees we can't accept payments less than €10. So your
			deposit will give roughly 10 months of premium service depending on
			usage. You can track your spending on the <a
			href="/user/prepaid/transactions">transactions page</a>.
		</p>
	{/if}
</div>

<style>
.country_form {
	display: flex;
	flex-direction: column;
	margin: auto;
	width: 600px;
	max-width: 100%;
}
.country_search {
	display: flex;
	flex-direction: row;
}

.processors {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.processors > div {
	display: flex;
	align-items: center;
	gap: 5px;
	margin: 3px;
}

.providers {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
}
.providers > button {
	flex-direction: column;
	justify-content: space-around;
}
.providers > button > img {
	max-width: 3em;
	max-height: 3em;
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
