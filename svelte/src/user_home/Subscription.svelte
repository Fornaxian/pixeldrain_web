<script>
import { onMount } from "svelte";
import Euro from "../util/Euro.svelte"
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";
import PatreonActivationResult from "./PatreonActivationResult.svelte";

let loading = false
let subscription = window.user.subscription.id
let subscription_type = window.user.subscription.type
let success_message

const update = async (plan) => {
	loading = true

	const form = new FormData()
	form.append("subscription", plan)

	try {
		{
			const resp = await fetch(
				window.api_endpoint+"/user",
				{ method: "PUT", body: form },
			)
			if(resp.status >= 400) {
				let json = await resp.json()
				throw json.message
			}

			success_message.set(true, "Subscription updated")
		}

		{
			const resp = await fetch(window.api_endpoint+"/user")
			if(resp.status >= 400) {
				let json = await resp.json()
				throw json.message
			}

			window.user = await resp.json()
			subscription = window.user.subscription.id
			subscription_type = window.user.subscription.type
		}
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
				to your account balance.
			</p>
			<p>
				If your account credit has not been updated, please check the
				status of your invoice on <a
				href="/user/prepaid/deposit#invoices">the invoices page</a>.
				Depending on the payment processor you used it can take a while
				before your credit is deposited. SEPA transfers can take up to
				two working days for example. When the deposit is complete you
				will receive an e-mail. If it takes too long, contact
				support@pixeldrain.com.
			</p>
		</div>
	{/if}

	<PatreonActivationResult/>

	<h2>Manage subscription</h2>
	<p>
		Here you can switch between different subscription plans.
	</p>
	<p>
		The Patreon subscription is managed by Patreon. Pixeldrain cannot modify
		or end your subsciption. If you would like to cancel your Patreon plan
		you can do that <a
		href="https://www.patreon.com/settings/memberships/pixeldrain"
		target="_blank">on Patreon</a>.
	</p>
	<p>
		The Prepaid plan is charged daily based on usage. When you reach
		negative balance the subscription will automatically end. You will need
		a positive balance to activate the subscription again.
	</p>

	<h3>Available subscription plans</h3>
	<SuccessMessage bind:this={success_message}/>

	<div class="feat_table">
		<div>
			<div class="feat_label" class:feat_highlight={subscription_type === "patreon"}>
				Patreon<br/>
				{#if subscription_type === "patreon"}
					Currently active<br/>
					<a class="button" href="https://www.patreon.com/settings/memberships/pixeldrain" target="_blank">
						<i class="icon">settings</i>
						Manage
					</a>
				{:else}
					<a class="button" href="/api/patreon_auth/start">
						<i class="icon">add_link</i>
						Link Patreon
					</a>
				{/if}
			</div>
			<div class="feat_normal round_tr" class:feat_highlight={subscription_type === "patreon"}>
				<p>
					This subscription is managed by Patreon. You will need to <a
					href="https://www.patreon.com/pixeldrain/membership"
					target="_blank">purchase a plan on Patreon</a> before you
					can activate this subscription. After your purchase you can
					click the "Link Patreon" button and your account will be
					upgraded.
				</p>
				<ul>
					<li>€4 per month</li>
					<li>No storage limit for file sharing</li>
					<li>4 TB transfer limit (higher plans available)</li>
					<li>Access to the <a href="/filesystem">filesystem</a></li>
					<li>2 TB filesytem storage limit (higher plans available)</li>
					<li>File expire after 240 days for Pro, and never on the other plans</li>
				</ul>
			</div>
		</div>
		<div>
			<div class="feat_label" class:feat_highlight={subscription === "prepaid"}>
				Prepaid (credit <Euro amount={window.user.balance_micro_eur}/>)<br/>
				{#if subscription === "prepaid"}
					Currently active
				{:else}
					<button on:click={() => update("prepaid")}>
						<i class="icon">attach_money</i>
						Activate
					</button>
				{/if}
			</div>
			<div class="feat_normal round_tr" class:feat_highlight={subscription === "prepaid"}>
				<p>
					You will need a positive account balance to activate this
					plan. If you currently have a Patreon subscription active,
					then enabling prepaid will not cancel that subscription. You
					can end your subscription <a
					href="https://www.patreon.com/settings/memberships/pixeldrain"
					target="_blank">on Patreon.com</a>.
				</p>
				<ul>
					<li>€4 per TB per month for storage</li>
					<li>
						€2 per TB for data transfer (with <a
						href="/user/sharing/bandwidth">bandwidth sharing</a>
						enabled)
					</li>
					<li>Access to the <a href="/filesystem">filesystem</a></li>
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
			<div class="feat_label" class:feat_highlight={subscription === ""}>
				Free<br/>
				{#if subscription === ""}
					Currently active
				{/if}
			</div>
			<div class="feat_normal round_br" class:feat_highlight={subscription === ""}>
				<ul>
					<li>Standard free plan, files expire after 120 days.</li>
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
	border-radius: 8px 0 0 8px;
}
.feat_table > div > div {
	flex: 1 1 0;
	margin: 2px;
	padding: 0.5em;
	word-wrap: break-word;
	hyphens: auto;
	border-radius: 0 8px 8px 0;
	border: 2px solid var(--separator)
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

/* On small screens we stack the table vertically */
@media(max-width: 800px) {
	.feat_table > div {
		flex-direction: column;
	}
	.feat_table > div > div:first-child {
		flex: 0 0 auto;
		border-radius: 8px 8px 0 0;
	}
	.feat_table > div > div {
		border-radius: 0 0 8px 8px;
	}
}
</style>
