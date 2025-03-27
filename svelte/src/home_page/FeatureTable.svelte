<script>
import Tooltip from "layout/Tooltip.svelte";
import Euro from "util/Euro.svelte";
import OtherPlans from "./OtherPlans.svelte";
</script>

<section>
	<p>
		Pixeldrain features two different payment modes. We offer a monthly
		subscription which is managed by Patreon, and a Prepaid subscription
		which supports a dozen different payment providers. With Prepaid you pay
		in advance to charge your credit, then usage will be subtracted from
		your account credit. For low usage Prepaid is usually better as the
		monthly fee is much lower.
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
			Recurring price
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">None</span>
		</div>
		<div class="feature_cell pro_feat">
			<Tooltip>
				<span slot="label">
					<span class="bold">€4 / month</span> or
					<span class="bold">€40 / year</span>
				</span>
				The Pro subscription is managed by Patreon. Patreon's own fees
				and sales tax will be added to this price. After paying you need
				to link your pixeldrain account to Patreon to activate the plan.
			</Tooltip>
		</div>
		<div class="feature_cell prepaid_feat">
			<Tooltip>
				<span slot="label" class="bold">€1 / month minimum</span>
				<p>
					The minimum fee is only charged when usage is less than €1.
					This calculation is per day, the €1 amount is divided by the
					number of days in the month and if your usage is lower than
					that, you will be charged the minimum fee.
				</p>
			</Tooltip>
		</div>

		<div class="left_col">
			<a href="/about#toc_3">Transfer limit</a>
		</div>
		<div class="feature_cell free_feat">
			<Tooltip>
				<span slot="label" class="bold">6 GB per day</span>
				<p>
					Free users are limited to downloading 6 GB per day, this
					limit is linked to your IP address, even if you are logged
					in to an account.
				</p>
				<p>
					When the download limit is exceeded the download speed is
					reduced to 1 MiB/s. You can have at most three concurrent
					downloads running.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell pro_feat">
			<Tooltip>
				<span slot="label" class="bold">4 TB per 30 days</span>
				<p>
					The transfer limit is used for downloading, sharing and
					hotlinking files.
				</p>
				<p>
					Paid plans do not have a concurrent connection limit.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell prepaid_feat">
			<Tooltip>
				<span slot="label" class="bold">€1 per TB transferred</span>
				<p>
					Prepaid does not have a transfer limit, instead you are
					charged for what you use at a rate of €1 per terabyte
					downloaded. This applies to downloading your own files,
					other people's files and others downloading your files (if
					you have hotlinking enabled in your account settings).
				</p>
				<p>
					Paid plans do not have a concurrent connection limit.
				</p>
			</Tooltip>
		</div>

		<div class="left_col">
			<a href="/about#toc_6">Hotlinking</a>
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
			No limit, you pay for what you use
		</div>

		<div class="left_col">
			<a href="/about#toc_1">File expiry</a>
		</div>
		<div class="feature_cell free_feat">
			<Tooltip>
				<span slot="label" class="bold">120 days (4 months)</span>
				<p>
					Files expire when they have not been downloaded in the last
					120 days. A download is counted when more than 10% of the
					whole file was downloaded in a single request.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell pro_feat">
			<Tooltip>
				<span slot="label" class="bold">240 days (8 months)</span>
				<p>
					The Pro plan has 240 day file expiry. The same rules apply
					as the free plan. Higher Patreon subscription plans are
					available where files do not expire at all.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell prepaid_feat">
			<Tooltip>
				<span slot="label" class="bold">Files do not expire</span>
				<p>
					Files don't expire while your Prepaid plan is active. If
					your credit runs out you have one week to top up your
					balance. If you fail to do so your files will revert to the
					regular file expiry rules.
				</p>
			</Tooltip>
		</div>

		<div class="left_col">
			Download page customization
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">None</span>
		</div>
		<div class="feature_cell pro_feat">
			None
		</div>
		<div class="feature_cell prepaid_feat">
			Theme, background, header and footer image can be customized
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
			<span class="bold">PayPal</span>, <span class="bold">Credit/debit</span>
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">PayPal</span>,
			<span class="bold">Credit/debit</span>,
			<span class="bold">iDEAL</span><br/>
			And many regional providers
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
				<a href="/login?redirect=/user/prepaid/deposit" class="button button_highlight round">
					<i class="icon">login</i>
					Log in
				</a>
				or
				<a href="/register?redirect=/user/prepaid/deposit" class="button button_highlight round">
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
					Prepaid subscription is active<br/>
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
	align-content: center;
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
