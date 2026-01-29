<script>
import Euro from "util/Euro.svelte";
import { formatDataVolume } from "util/Formatting";
</script>

<ul>
	<li>
		Supporter level: {window.user.subscription.name}<br/>
		<i class="icon">shopping_cart</i>
		<a href="/user/subscription">Manage subscriptions</a><br/>
		<i class="icon">star</i>
		<a href="/api/patreon_auth/start">Activate Patreon subscription</a>
	</li>

	{#if window.user.balance_micro_eur !== 0}
		<li>
			Current account balance: <Euro amount={window.user.balance_micro_eur}></Euro><br/>

			<i class="icon">account_balance_wallet</i>
			<a href="/user/prepaid/deposit">Deposit credit</a><br/>

			<i class="icon">receipt</i>
			<a href="/user/prepaid/transactions">Transaction log</a>

			{#if window.user.balance_micro_eur > 0 && window.user.subscription.id === ""}
				<br/>
				You have account credit but no active subscription. Activate
				a subscription on the <a href="/user/subscription">subscriptions page</a>
			{/if}
		</li>
	{/if}

	<li>
		Max file size: {formatDataVolume(window.user.subscription.file_size_limit, 3)}
	</li>
	<li>
		{#if window.user.subscription.storage_space > 0}
			Storage limit: {formatDataVolume(window.user.subscription.storage_space, 3)}
		{:else}
			No storage limit
		{/if}
	</li>
	<li>
		{#if window.user.subscription.monthly_transfer_cap > 0}
			Data transfer limit: {formatDataVolume(window.user.subscription.monthly_transfer_cap, 3)}
		{:else}
			No data transfer limit
		{/if}
	</li>

	<li>
		{#if window.user.subscription.file_expiry_days > 0}
			Files expire after {window.user.subscription.file_expiry_days} days
		{:else}
			Files never expire
		{/if}
	</li>

	{#if window.user.subscription.id !== ""}
		<li>
			Support: For questions related to your account you can send a
			message to <a
			href="mailto:support@pixeldrain.com">support@pixeldrain.com</a>.
			Make sure to include your username.
		</li>
	{/if}
</ul>

<style>
ul {
	margin: 0;
}
</style>
