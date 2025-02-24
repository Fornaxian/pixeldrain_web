<script>
import Euro from "../util/Euro.svelte";
import OtherPlans from "./OtherPlans.svelte";
</script>

<section>
	<p>
		Pixeldrain features two different payment modes. We offer a monthly
		subscription which is managed by Patreon, and a prepaid service which
		supports a dozen different payment providers. For low usage Prepaid is
		usually better as there's no monthly fee.
	</p>
</section>

<div class="vertical_scroll">
	<div class="grid">
		<div></div>
		<div class="top_row free_feat">
			<span class="bold">Free</span>
		</div>
		<div class="top_row pro_feat">
			<span class="bold">Pro</span>
		</div>
		<div class="top_row prepaid_feat">
			<span class="bold">Prepaid</span>
		</div>

		<div class="left_col">
			Price
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">Free</span>
		</div>
		<div class="feature_cell pro_feat">
			<span class="bold">€4 / month</span> or
			<span class="bold">€40 / year</span><br/>
			Charged through Patreon
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">€1 / month minimum</span><br/>
			Only charged when total usage is below €1
		</div>

		<div class="left_col">
			<a class="round button" href="/about#toc_3">
				<i class="icon">info</i>
				Transfer limit
			</a>
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">6 GB per day</span><br/>

			Download speed is reduced to 1 MiB/s when exceeded. Max 5 concurrent
			downloads
		</div>
		<div class="feature_cell pro_feat">
			<span class="bold">4 TB per 30 days</span><br/>

			Transfer limit is used for downloading, sharing and hotlinking. No
			connection limit
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">€1 per TB transferred</span><br/>

			Used for downloading, sharing and hotlinking. You only pay for what
			you use. No connection limit
		</div>

		<div class="left_col">
			<a class="round button" href="/about#toc_6">
				<i class="icon">info</i>
				Hotlinking
			</a>
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">Hotlinking not supported</span><br/>
			Hotlinked files get blocked
		</div>
		<div class="feature_cell span2 right pro_feat">
			<span class="bold">Hotlinking supported</span><br/>
			Hotlinking uses your transfer limit
		</div>

		<div class="left_col">
			Storage
		</div>
		<div class="feature_cell span2 left pro_feat">
			<span class="bold">No limit</span><br/>
			Files expire when they are not downloaded
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">€4 / TB / month</span><br/>
			No limit, you only pay for what you use
		</div>

		<div class="left_col">
			<a class="round button" href="/about#toc_1">
				<i class="icon">info</i>
				File expiry
			</a>
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">120 days</span> (4 months)
		</div>
		<div class="feature_cell pro_feat">
			<span class="bold">240 days</span> (8 months)<br/>
			Plans without expiry are available
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">Files do not expire</span><br/>
			While prepaid plan is active
		</div>

		<div class="left_col">
			Max file size
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">20 GB</span> per file
		</div>
		<div class="feature_cell span2 right pro_feat">
			<span class="bold">100 GB</span> per file
		</div>

		<div class="left_col">
			Payment processors
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">None</span>
		</div>
		<div class="feature_cell pro_feat">
			<span class="bold">PayPal</span>, <span class="bold">Credit card</span>
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">PayPal</span>, <span class="bold">SEPA</span>,
			<span class="bold">Credit card</span><br/>
			And many more
		</div>

		<div></div>
		<div class="bottom_row free_feat">
			Free
		</div>
		<div class="bottom_row pro_feat">
			{#if window.user.subscription.id === "patreon_1"}
				You have this plan<br/>
				Thank you for supporting pixeldrain!
			{:else}
				<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5736701&cadence=1" class="button button_highlight round">
					€ 4 per month
				</a>
				or
				<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5736701&cadence=12" class="button button_highlight round">
					€ 40 per year!
				</a>
				<br/>
				(Excluding tax)
				<br/>
				Subscription managed by Patreon
			{/if}
		</div>
		<div class="bottom_row prepaid_feat">
			{#if window.user.username === ""}
				<!-- User is not logged in -->
				Account required<br/>
				<a href="/login?redirect=checkout" class="button button_highlight round">
					<i class="icon">login</i>
					Log in
				</a>
				or
				<a href="/register?redirect=checkout" class="button button_highlight round">
					<i class="icon">how_to_reg</i>
					Register
				</a>
				<br/>
				Payments processed by Mollie<br/>
				No recurring payments
			{:else}
				<!-- User is logged in -->
				{#if window.user.subscription.type === ""}
					<a href="/user/prepaid/deposit#deposit" class="button button_highlight round">
						Deposit credit
					</a>
					to activate Prepaid
				{:else if window.user.subscription.type === "patreon"}
					Patreon subscription active. Prepaid cannot be activated
				{:else if window.user.subscription.type === "prepaid"}
					Prepaid plan is active.<br/>
					Current balance <Euro amount={window.user.balance_micro_eur}/>
					<br/>
					<a href="/user/prepaid/deposit#deposit" class="button button_highlight round">
						Top up my credit
					</a>
				{/if}
			{/if}
		</div>
	</div>
</div>

<section>
	<h2>Other plans available on Patreon</h2>
	<OtherPlans/>
</section>

<style>
.bold {
	font-weight: bold;
}

.vertical_scroll {
	overflow-x: scroll;
	overflow-y: hidden;
	width: 100%;
}

.grid {
	display: inline-grid;
	grid-auto-flow: row;
	grid-template-columns: 9em 1fr 1fr 1fr;
	min-width: 40em;
	max-width: 70em;
	gap: 5px;
	margin: 10px;
}
.grid > div {
	justify-content: center;
	align-items: center;
	text-align: center;
	padding: 0.25em;
	min-height: 3em;
}

.left_col {
	border-top-left-radius: 6px;
	border-bottom-left-radius: 6px;
	border: 1px solid var(--separator);
}
.top_row {
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
}
.bottom_row {
	border-bottom-left-radius: 6px;
	border-bottom-right-radius: 6px;
	border: 1px solid var(--separator);
	font-weight: bold;
}
.feature_cell {
	background-color: var(--card_color);
	border: 1px solid var(--background_color);
}
.pro_feat {
	border: 1px solid var(--highlight_color);
}
.free_feat {
	border: 1px solid #ebcb8b;
}
.prepaid_feat {
	border: 1px solid #ec2cfa;
}
.span2 {
	grid-column: span 2;
}
.span2.left {
	border-image: linear-gradient(to right, #ebcb8b 0%, var(--highlight_color) 100%) 1;
}
.span2.right {
	border-image: linear-gradient(to right, var(--highlight_color) 0%, #ec2cfa 100%) 1;
}
</style>
