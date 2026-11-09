<script>
import Tooltip from "layout/Tooltip.svelte";
import Euro from "util/Euro.svelte";
import OtherPlans from "./OtherPlans.svelte";
</script>

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
				{#snippet label()}
					<span>
						<span class="bold">€4 / month</span> or
						<span class="bold">€40 / year</span>
					</span>
				{/snippet}
				The Pro subscription is managed by Patreon. Patreon's own fees
				and sales tax will be added to this price. After paying you need
				to link your pixeldrain account to Patreon to activate the plan.
			</Tooltip>
		</div>
		<div class="feature_cell prepaid_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">€0.01 / day minimum</span>
				{/snippet}
				<p>
					The minimum fee is only charged when daily usage is less
					than €0.01.
				</p>
			</Tooltip>
		</div>

		<div class="left_col">
			Storage
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">No limit</span>
		</div>
		<div class="feature_cell pro_feat">
			<span class="bold">No limit</span> for regular uploads<br/> 2 TB
			limit for <a
			href="https://docs.pixeldrain.com/filesystem/">filesystem</a>
			uploads
		</div>
		<div class="feature_cell prepaid_feat">
			<span class="bold">€4 / TB / month</span><br/>
			No limit, you pay for what you use
		</div>

		<div class="left_col">
			Egress transfer limit
		</div>
		<div class="feature_cell free_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">6 GB per day</span>
				{/snippet}
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
				{#snippet label()}
					<span class="bold">4 TB per 30 days</span>
				{/snippet}
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
				{#snippet label()}
					<span class="bold">€1 per TB transferred</span>
				{/snippet}
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
			Hotlinking
		</div>
		<div class="feature_cell free_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">Hotlinking not supported</span>
				{/snippet}
				<p>
					This means that you cannot embed your files in other
					websites or download files without passing through the
					download page first.
				</p>
				<p>
					For more information, see <a
					href="https://docs.pixeldrain.com/questions_and_answers/#how-does-hotlinking-work">the
					documentation site</a>.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell span2 right pro_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">Hotlinking supported</span>
				{/snippet}
				<p>
					With hotlinking you can directly embed your videos, images
					and other files into your own website. You also don't need
					to go through the download page to download files. You can
					use download managers without problems.
				</p>
				<p>
					For more information, see <a
					href="https://docs.pixeldrain.com/questions_and_answers/#how-does-hotlinking-work">the
					documentation site</a>.
				</p>
			</Tooltip>
		</div>

		<div class="left_col">
			File expiry
		</div>
		<div class="feature_cell free_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">60 days (2 months)</span>
				{/snippet}
				<p>
					Files expire when they have not been downloaded in the last
					60 days. A download is counted when more than 10% of the
					whole file was downloaded in a single request.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell pro_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">120 days (4 months)</span>
				{/snippet}
				<p>
					Files expire when they have not been downloaded in the last
					120 days. A download is counted when more than 10% of the
					whole file was downloaded in a single request. Higher
					Patreon subscription plans are available where files do not
					expire at all.
				</p>
			</Tooltip>
		</div>
		<div class="feature_cell prepaid_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">Files do not expire</span>
				{/snippet}
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
			File embedding
		</div>
		<div class="feature_cell span2 left pro_feat">
			<span class="bold">No</span>
		</div>
		<div class="feature_cell prepaid_feat">
			<Tooltip>
				{#snippet label()}
					<span class="bold">Yes</span>
				{/snippet}
				<p>
					You can embed files on your website either with an iframe
					tag or directly with video or image elements. You can
					control which domain names are allowed to embed your files
					on the <a href="/user/sharing/embedding">embedding
					controls</a> page.
				</p>
			</Tooltip>
		</div>

		<div class="left_col">
			Max file size
		</div>
		<div class="feature_cell free_feat">
			<span class="bold">10 GB</span> per file
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
			<span class="bold">Bitcoin</span>,
			<span class="bold">Litecoin</span>,
			<span class="bold">Monero</span>,
			<span class="bold">Dogecoin</span>
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
	min-width: 50em;
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
