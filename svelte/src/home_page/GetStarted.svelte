<script>
import LoginRegister from "login/LoginRegister.svelte";
import MollieDeposit from "user_home/MollieDeposit.svelte";
import Euro from "util/Euro.svelte";
</script>

{#if window.user.username !== ""}
	<div class="page_content">
		<section>
			{#if window.user.subscription.type === "patreon"}
				<p>
					You already have a Patreon subscription active. You cannot use
					Prepaid while that subscription is active.
				</p>

			{:else if window.user.subscription.type === "prepaid"}
				<p>
					You already have a Prepaid subscription active. Your account
					balance is <Euro amount={window.user.balance_micro_eur}/>. Use
					the form below to top up your balance.
				</p>
				<MollieDeposit/>
			{:else}
				<p>
					You are currently logged in as '{window.user.username}'. Use the
					form below to activate prepaid on this account.
				</p>
				<MollieDeposit/>
			{/if}
		</section>
	</div>
{:else}
	<LoginRegister/>
{/if}

<style>
.page_content {
	margin-top: 16px;
	margin-bottom: 16px;
}
</style>
