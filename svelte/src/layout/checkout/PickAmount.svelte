<script lang="ts">
import Euro from "util/Euro.svelte";
import { checkout, type CheckoutState } from "./CheckoutLib";

export let state: CheckoutState
export let loading: boolean

const amounts = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
let amount = 20

const submit = async (e: SubmitEvent) => {
	e.preventDefault()

	loading = true
	state.amount = amount
	await checkout(state)
	loading = false
}
</script>

{#if state.provider.crypto === true}
	<p style="text-align: initial;" class="highlight_blue">
		When paying with cryptocurrencies it is important that you pay
		the <b>exact amount</b> stated on the order. If you pay too
		little, the order fails. If you pay too much then the remaining
		credit will not be added to your account. Pay close attention
		when sending a payment from an online exchange, sometimes they
		will subtract the fees from the amount sent which will cause the
		payment to fail.
	</p>
{/if}

<form class="amount_grid" on:submit={submit}>
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

	<div class="span3 custom_amount">
		<div>Custom amount €</div>
		<input type="number" bind:value={amount} min="10"/>
	</div>

	<div class="span2" style="text-align: initial;">
		Total including VAT:
		<Euro amount={(amount*1e6) + (amount*1e6)*(state.vat/100)}/>
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

<style>
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

.span2 { grid-column: span 2; }
.span3 { grid-column: span 3; }

.custom_amount {
	display: flex;
	flex-direction: row;
}
.custom_amount > div {
	display: flex;
	flex: 0 0 auto;
	align-items: center;
}
.custom_amount > input {
	flex: 1 1 auto;
}
</style>
