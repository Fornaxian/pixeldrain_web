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

let loading = $state(false)
let status: CheckoutState = $state({country: null, provider: null, amount: 0, vat: 0, name: ""})

onMount(async () => {
	try {
		const user = await get_user()

		// Get the country from the user profile
		if (user.checkout_country !== "" && countries[user.checkout_country] !== undefined) {
			const vat_rate = await get_misc_vat_rate(user.checkout_country)
			status.vat = vat_rate.vat*100
			status.country = countries[user.checkout_country]
		}

		// Get the provider from the user profile
		for (const p of payment_providers) {
			if (p.name === user.checkout_provider) {
				status.provider = p
				break
			}
		}

		// Get the checkout name from the user profile
		if (user.checkout_name !== "") {
			status.name = user.checkout_name
		}
	}catch (err) {
		alert("Failed to get user:"+err)
	}
})
</script>

<div class="highlight_border">
	<LoadingIndicator loading={loading}/>

	{#if status.country !== null}
		<div class="navbar">
			{#if status.country !== null}
				<button onclick={() => status.country = null}>
					Country:
					<span style="font-size: 1.5em; line-height: 1em;">{status.country.emoji}</span>
					{status.country.name}
				</button>
			{/if}

			{#if status.provider !== null}
				<button onclick={() => status.provider = null}>
					Provider:
					<img
						class="provider_icon"
						src="/res/img/payment_providers/{status.provider.icon}.svg"
						alt={status.provider.label}
						title={status.provider.label}/>
					{status.provider.label}
				</button>
			{/if}

			{#if status.name !== ""}
				<button onclick={() => status.name = ""}>
					Name: {status.name}
				</button>
			{/if}
		</div>
		<hr/>
	{/if}

	{#if status.country === null}
		<PickCountry bind:status bind:loading={loading}/>
	{:else if status.provider === null}
		<PickProvider bind:status/>
	{:else if status.provider.need_name === true && status.name === ""}
		<PickName bind:status/>
	{:else}
		<PickAmount bind:status bind:loading/>
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
