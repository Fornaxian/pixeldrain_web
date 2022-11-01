<script>
import Euro from "../util/Euro.svelte"
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";

let loading = false
let subscription = window.user.subscription.id
let success_message

const update = async () => {
	loading = true

	const form = new FormData()
	form.append("update", "subscription")
	form.append("subscription", subscription)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user/subscription",
			{ method: "PUT", body: form },
		)
		if(resp.status >= 400) {
			let json = await resp.json()
			throw json.message
		}

		success_message.set(true, "Subscription updated")
	} catch (err) {
		success_message.set(false, "Failed to update subscription: "+err)
	} finally {
		loading = false
	}
}
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2>Manage subscription</h2>
	<p>
		Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro>
	</p>
	<p>
		When your prepaid subscription is active you will be charged daily based
		on usage. The prepaid subscription will stay active for as long as you
		have credit on your account. When you reach negative balance the
		subscription will automatically end. You will need a positive balance to
		activate the subscription again.
	</p>

	<h3>Prepaid plans</h3>
	<SuccessMessage bind:this={success_message}/>

	<div class="feat_table">
		<div>
			<div class="feat_label" class:feat_highlight={subscription === "prepaid"}>
				Prepaid<br/>
				{#if subscription === "prepaid"}
					Currently active
				{:else}
					<button on:click={() => {subscription = "prepaid"; update("subscription")}}>
						<i class="icon">attach_money</i>
						Activate
					</button>
				{/if}
			</div>
			<div class="feat_normal round_tr" class:feat_highlight={subscription === "prepaid"}>
				<ul>
					<li>Base price of €1 per month</li>
					<li>€4 per TB per month for storage</li>
					<li>€2 per TB for data transfer</li>
					<li>Files never expire as long as subscription is active</li>
				</ul>
			</div>
		</div>
		<div>
			<div class="feat_label" class:feat_highlight={subscription === "prepaid_temp_storage_120d"}>
				120 days storage<br/>
				{#if subscription === "prepaid_temp_storage_120d"}
					Currently active
				{:else}
					<button on:click={() => {subscription = "prepaid_temp_storage_120d"; update("subscription")}}>
						<i class="icon">attach_money</i>
						Activate
					</button>
				{/if}
			</div>
			<div class="feat_normal" class:feat_highlight={subscription === "prepaid_temp_storage_120d"}>
				<ul>
					<li>Base price of €1 per month</li>
					<li>€0.50 per TB per month for storage</li>
					<li>€2 per TB for data transfer</li>
					<li>Files expire 120 days after the last time they're viewed</li>
				</ul>
			</div>
		</div>
		<div>
			<div class="feat_label" class:feat_highlight={subscription === ""}>
				Free<br/>
				{#if subscription === ""}
					Currently active
				{:else}
					<button on:click={() => {subscription = ""; update("subscription")}}>
						<i class="icon">money_off</i>
						Activate
					</button>
				{/if}
			</div>
			<div class="feat_normal round_br" class:feat_highlight={subscription === ""}>
				<ul>
					<li>Standard free plan, files expire after 60 days.</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
.feat_table {
	display: flex;
	flex-direction: column;
}
.feat_table > div {
	display: flex;
	flex-direction: row;
}
.feat_table > div > div:first-child {
	flex: 0 0 25%;
	max-width: 25%;
}
.feat_table > div > div {
	flex: 1 1 0;
	margin: 0.25em;
	padding: 0.5em;
	word-wrap: break-word;
	hyphens: auto;
}
.feat_table > div > .feat_label {
	border-top-left-radius: 0.5em;
	border-bottom-left-radius: 0.5em;
	border: 2px solid var(--separator);
	font-size: 1.1em;
}
.feat_table > div > .feat_normal {
	background: var(--card_color);
}
.feat_table > div > .feat_highlight {
	border: 2px solid var(--highlight_color)
}

.feat_table > div > div.round_tr { border-top-right-radius:    0.5em; }
.feat_table > div > div.round_br { border-bottom-right-radius: 0.5em; }
</style>
