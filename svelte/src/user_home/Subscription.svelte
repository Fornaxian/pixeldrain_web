<script>
import { onMount } from "svelte";
import Euro from "../util/Euro.svelte"
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";

let loading = false
let subscription = window.user.subscription.id
let success_message

const update = async () => {
	loading = true

	const form = new FormData()
	form.append("subscription", subscription)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user",
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

let checkout_success = false

onMount(() => {
	if (window.location.hash === "#checkout_complete") {
		checkout_success = true
	}
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	{#if checkout_success}
		<div class="highlight_green">
			<h2>Payment successful!</h2>
			<p>
				Thank you for supporting pixeldrain! The credit has been added
				to your account balance. Activate a subscription plan below to
				finish upgrading your account.
			</p>
			<p>
				If your account credit has not been updated, please check the
				status of your invoice on <a
				href="/user/prepaid/deposit#invoices">the invoices page</a>.
				Depending on the payment processor you used it can take a while
				before your credit is deposited. SEPA transfers can take up to
				two working days for example. If it takes too long contact
				support@pixeldrain.com.
			</p>
		</div>
	{/if}

	{#if window.user.subscription.type === "patreon"}
		<div class="highlight_yellow">
			<p>
				Activating a prepaid subscription will not cancel your active
				Patreon subscription. Go to Patreon's
				<a
				href="https://www.patreon.com/settings/memberships">memberships
				page</a> to end your subscription there.
			</p>
			<p>
				If you enable a prepaid plan here your Patreon subscription will
				be overridden. If you wish to go back to your Patreon plan use
				the <a href="/user/home">Link Patreon subscription</a> button on
				the home page to link your Patreon account back to pixeldrain.
			</p>
		</div>
	{/if}

	<h2>Manage subscription</h2>
	<p>
		Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro>
	</p>
	<p>
		Prepaid subscriptions are charged daily based on usage. When you reach
		negative balance the subscription will automatically end. You will need
		a positive balance to activate the subscription again.
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
					<li>Base price of €2 per month</li>
					<li>€4 per TB per month for storage</li>
					<li>
						€2 per TB for data transfer (with <a
						href="user/sharing/bandwidth">bandwidth sharing</a>
						enabled)
					</li>
					<li>Files never expire as long as subscription is active</li>
					<li>
						Download page <a href="/user/sharing/branding">branding
						options</a>
					</li>
					<li>
						File <a href="/user/sharing/embedding">embedding
						control</a> options
					</li>
				</ul>
			</div>
		</div>
		<div>
			<div class="feat_label" class:feat_highlight={subscription === "prepaid_temp_storage_120d"}>
				240 days storage<br/>
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
					<li>
						€2 per TB for data transfer (with <a
						href="user/sharing/bandwidth">bandwidth sharing</a>
						enabled)
					</li>
					<li>
						Files expire 240 days after they are last viewed or
						downloaded
					</li>
					<li>
						Download page <a href="/user/sharing/branding">branding
						options</a>
					</li>
					<li>
						File <a href="/user/sharing/embedding">embedding
						control</a> options
					</li>
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
					<li>Standard free plan, files expire after 90 days.</li>
					<li>Download limit of 5 GB per day</li>
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
