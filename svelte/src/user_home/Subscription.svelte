<script>
import Spinner from "../util/Spinner.svelte";
import Euro from "../util/Euro.svelte"

let loading = false

let result = ""
let result_success = false

const update_subscription = async name => {
	loading = true

	const form = new FormData()
	form.append("subscription", name)
	try {
		const resp = await fetch(
			window.api_endpoint+"/user/subscription",
			{ method: "PUT", body: form },
		)
		if(resp.status >= 400) {
			let json = await resp.json()
			throw json.message
		}

		result_success = true
		result = "Subscription updated"

		setTimeout(() => {location.reload()}, 1000)
	} catch (err) {
		result_success = false
		result = "Failed to update subscription: "+err
		loading = false
	}
}

</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}
	<div class="limit_width">
		<h2>Manage subscription</h2>
		<p>
			Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro>
		</p>
		<p>
			When your prepaid subscription is active you will be charged daily
			based on usage. Hotlink bandwidth is charged per TB based on the
			usage of the previous day. The amount charged for storage each day
			is your storage usage at the end of the day multiplied by the
			storage price (€4 / TB) and divided by the average number of days in
			a month (30.4375). So if you have exactly 1 TB on your account you
			will be charged €0.131416838 per day.
		</p>
		<p>
			The prepaid subscription will stay active for as long as you have
			credit on your account. When you reach negative balance the
			subscription will automatically end. You will need a positive
			balance to activate the subscription again.
		</p>

		{#if result !== ""}
			<div class:highlight_green={result_success} class:highlight_red={!result_success}>
				{result}
			</div>
		{/if}

		<div class="feat_table">
			<div>
				<div class="feat_label" class:feat_highlight={window.user.subscription.id === "prepaid"}>
					Prepaid<br/>
					{#if window.user.subscription.id === "prepaid"}
						Currently active
					{:else}
						<button on:click={() => {update_subscription("prepaid")}}>
							<i class="icon">attach_money</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal round_tr">
					<ul>
						<li>Base price of €2 per month (includes all the benefits of the Pro plan)</li>
						<li>€4 per TB per month for storage</li>
						<li>€2 per TB for hotlink bandwidth</li>
						<li>All advertisements disabled</li>
						<li>No rate limit, your files will download at the highest speed possible</li>
					</ul>
				</div>
			</div>
			<div>
				<div class="feat_label" class:feat_highlight={window.user.subscription.id === "prepaid_storage"}>
					Just storage<br/>
					{#if window.user.subscription.id === "prepaid_storage"}
						Currently active
					{:else}
						<button on:click={() => {update_subscription("prepaid_storage")}}>
							<i class="icon">attach_money</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal">
					<ul>
						<li>Base price of €1 per month</li>
						<li>€4 per TB per month for storage</li>
						<li>100 GB of hotlink bandwidth per month</li>
						<li>You don't see ads, but people downloading your files do see ads</li>
					</ul>
				</div>
			</div>
			<div>
				<div class="feat_label" class:feat_highlight={window.user.subscription.id === "prepaid_storage_temp"}>
					Temporary storage<br/>
					{#if window.user.subscription.id === "prepaid_storage_temp"}
						Currently active
					{:else}
						<button on:click={() => {update_subscription("prepaid_storage_temp")}}>
							<i class="icon">attach_money</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal">
					<ul>
						<li>Base price of €1 per month</li>
						<li>€2 per TB per month for storage</li>
						<li>100 GB of hotlink bandwidth per month</li>
						<li>You don't see ads, but people downloading your files do see ads</li>
						<li>Files expire 90 days after the last time they're viewed</li>
					</ul>
				</div>
			</div>
			<div>
				<div class="feat_label" class:feat_highlight={window.user.subscription.id === ""}>
					Free<br/>
					{#if window.user.subscription.id === ""}
						Currently active
					{:else}
						<button on:click={() => {update_subscription("none")}}>
							<i class="icon">money_off</i>
							Activate
						</button>
					{/if}
				</div>
				<div class="feat_normal round_br">
					<ul>
						<li>Standard free plan, files expire after 30 days.</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}
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
	background-color: var(--layer_1_color);
	font-size: 1.1em;
	color: #ffffff;
	text-shadow: 0 0 3px #000000;
}
.feat_table > div > .feat_normal {
	background-color: var(--layer_3_color);
	box-shadow: 1px 1px 3px -1px var(--shadow_color);
	text-shadow: 1px 1px 3px var(--shadow_color);
}
.feat_table > div > .feat_highlight {
	border: 1px solid var(--highlight_color)
}

.feat_table > div > div.round_tr { border-top-right-radius:    0.5em; }
.feat_table > div > div.round_br { border-bottom-right-radius: 0.5em; }

</style>
