<script lang="ts">
import { put_user } from "lib/PixeldrainAPI";
import { type CheckoutState } from "./CheckoutLib";

export let state: CheckoutState
let name: string

const submit = async (e: SubmitEvent) => {
	e.preventDefault()

	try {
		await put_user({checkout_name: name})
	} catch(err) {
		alert("Failed to update user:"+ err)
	}

	state.name = name
}
</script>

<form class="name_form" on:submit={submit}>
	<div>
		This payment provider requires a name for checkout. Please enter your
		full name below
	</div>
	<input bind:value={name} type="text" autocomplete="name"/>

	<button type="submit" class="button_highlight" style="align-self: end;">
		Continue
		<i class="icon">chevron_right</i>
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
.name_form {
	display: flex;
	flex-direction: column;
	margin: auto;
	width: 500px;
	max-width: 100%;
}
</style>
