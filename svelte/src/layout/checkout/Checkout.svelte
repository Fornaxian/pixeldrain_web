<script lang="ts">
import { onMount } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import PickAmount from "./PickAmount.svelte";
import PickCountry from "./PickCountry.svelte";
import { payment_providers, type CheckoutState } from "./CheckoutLib";
import PickName from "./PickName.svelte";
import { get_misc_vat_rate, get_user } from "lib/PixeldrainAPI";
import { countries } from "country-data-list";
import PickProvider from "./PickProvider.svelte";

let loading = false
let state: CheckoutState = {country: null, provider: null, amount: 0, vat: 0, name: ""}

onMount(async () => {
	try {
		const user = await get_user()

		// Get the country from the user profile
		if (user.checkout_country !== "" && countries[user.checkout_country] !== undefined) {
			const vat_rate = await get_misc_vat_rate(user.checkout_country)
			state.vat = vat_rate.vat*100
			state.country = countries[user.checkout_country]
		}

		// Get the provider from the user profile
		for (const p of payment_providers) {
			if (p.name === user.checkout_provider) {
				state.provider = p
				break
			}
		}

		// Get the checkout name from the user profile
		if (user.checkout_name !== "") {
			state.name = user.checkout_name
		}
	}catch (err) {
		alert("Failed to get user:"+err)
	}
})
</script>

<div class="highlight_border">
	<LoadingIndicator loading={loading}/>

	{#if state.country !== null}
		<div class="navbar">
			{#if state.country !== null}
				<button on:click={() => state.country = null}>
					Country:
					<span style="font-size: 1.5em; line-height: 1em;">{state.country.emoji}</span>
					{state.country.name}
				</button>
			{/if}

			{#if state.provider !== null}
				<button on:click={() => state.provider = null}>
					Provider:
					<img
						class="provider_icon"
						src="/res/img/payment_providers/{state.provider.icon}.svg"
						alt={state.provider.label}
						title={state.provider.label}/>
					{state.provider.label}
				</button>
			{/if}

			{#if state.name !== ""}
				<button on:click={() => state.name = ""}>
					Name: {state.name}
				</button>
			{/if}
		</div>
		<hr/>
	{/if}

	{#if state.country === null}
		<PickCountry bind:state bind:loading={loading}/>
	{:else if state.provider === null}
		<PickProvider bind:state/>
	{:else if state.provider.need_name === true && state.name === ""}
		<PickName bind:state/>
	{:else}
		<PickAmount bind:state bind:loading/>
	{/if}
</div>

<style>
.navbar {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.5em;
}
.provider_icon {
	height: 1.5em;
}
</style>
