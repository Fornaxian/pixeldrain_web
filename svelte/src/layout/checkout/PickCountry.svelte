<script lang="ts">
import { countries } from "country-data-list";
import { get_misc_vat_rate, put_user } from "lib/PixeldrainAPI";
import { payment_providers, type CheckoutState } from "./CheckoutLib";

export let state: CheckoutState
export let loading: boolean
let country_input = ""

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

	// We always clear the provider field after picking a country, as providers
	// vary per country. If we did not clear the provider then we may end up
	// with an invalid combination
	state.provider = null

	try {
		// Save the user's country for later use
		await put_user({checkout_country: c.alpha3})

		const vat_rate = await get_misc_vat_rate(c.alpha3)
		state.vat = vat_rate.vat*100
		state.country = c
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
			<img class="bankicon" src="/res/img/payment_providers/{p.icon}.svg" alt={p.label} title={p.label}/>
			{p.label}
		</div>
	{/each}
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
.bankicon {
	width: 2em;
}
</style>
