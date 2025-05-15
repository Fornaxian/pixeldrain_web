<script lang="ts">
import { put_user } from "lib/PixeldrainAPI";
import { payment_providers, type CheckoutState, type PaymentProvider } from "./CheckoutLib";

export let state: CheckoutState

const set_provider = async (p: PaymentProvider) => {
	try {
		await put_user({checkout_provider: p.name})
	} catch(err) {
		alert("Failed to update user:"+ err)
	}

	state.provider = p
}
</script>

<span>Please select a payment provider</span>

<div class="providers">
	{#each payment_providers as p (p.name)}
		{#if p.country_filter === undefined || p.country_filter.includes(state.country.alpha2)}
			<button on:click={() => set_provider(p)}>
				<img src="/res/img/payment_providers/{p.icon}.svg" alt={p.label} title={p.label}/>
				{p.label}
			</button>
		{/if}
	{/each}
</div>

<style>
.providers {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
}
.providers > button {
	flex-direction: column;
	justify-content: space-around;
}
.providers > button > img {
	max-width: 3em;
	max-height: 3em;
}
</style>
