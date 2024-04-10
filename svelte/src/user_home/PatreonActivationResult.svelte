<script>
import { onMount } from "svelte";

let patreon_result = ""
let patreon_message = ""
let patreon_error = ""

onMount(() => {
	if (window.location.hash.startsWith("#")) {
		const hash = window.location.hash.replace("#", "");
		const result = hash.split('&').reduce((res, item) => {
			const parts = item.split('=')
			res[parts[0]] = decodeURIComponent(parts[1])
			return res;
		}, {});

		if (result.patreon_result) {
			patreon_result = result.patreon_result
		}
		if (result.patreon_message) {
			patreon_message = result.patreon_message
		}
		if (result.patreon_error) {
			patreon_error = result.patreon_error
		}
	}
})
</script>


{#if patreon_result !== ""}
	{#if patreon_error === "patreon_authentication_denied"}
		<div class="highlight_yellow">
			Please press "Allow" when asked if pixeldrain can access your
			profile.
		</div>
	{:else if patreon_result === "error"}
		<div class="highlight_red">
			<p>
				An error occurred while linking Patreon subscription. Check if
				there are any Pixeldrain integrations under "Logged in with
				Patreon" on this page: <a
				href="https://www.patreon.com/settings/apps">https://www.patreon.com/settings/apps</a>.
				Try disconnecting all Pixeldrain logins and try again.
			</p>
			<p>
				It might also help to try linking the subscription in a
				different web browser. Sometimes cookies or cached redirects can
				cause issues with the authentication process. Try linking your
				subscription in <a
				href="https://www.mozilla.org/firefox/">Firefox</a> for example.
			<p/>
			<p>
				If the information above does not solve your issue then please
				contact me on <a
				href="https://www.patreon.com/messages">Patreon</a> or <a
				href="https://discord.gg/UDjaBGwr4p">Discord</a>. When
				contacting support please provide the following
				information:<br/> Server response: {patreon_message}<br/> Server
				error code: {patreon_error}
			</p>
		</div>
	{:else if patreon_result === "pledge_not_found"}
		<div class="highlight_yellow">
			<p>
				We were not able to find your payment on Patreon. There can be a
				few reasons for this, which I will list below:
			</p>
			<ol>
				<li>
					Your payment is not confirmed yet. It can take up to 30
					minutes before your payment is confirmed. If you paid with
					PayPal it's usually instant, but with creditcard it can take
					longer. If your payment is not confirmed after 30 minutes
					please contact me on <a
					href="https://www.patreon.com/messages">Patreon</a> or <a
					href="https://discord.gg/UDjaBGwr4p">Discord</a>.
				</li>
				<li>
					You pledged without selecting a support tier. It happens
					sometimes that people pledge an amount of money without
					selecting a support tier. If you don't have a tier
					pixeldrain won't know which subscription you should get,
					regardless of how much you paid. To fix this you can select
					a tier from <a
					href="https://www.patreon.com/pixeldrain/membership">the
					memberships page</a> and proceed to checkout. If you already
					pledged the right amount you will not have to pay again.
				</li>
				<li>
					Or you have not pledged at all yet. In that case it's
					simple: <a
					href="https://www.patreon.com/pixeldrain/membership">go to
					Patreon</a> and purchase a membership.
				</li>
			</ol>
			<p>
				When contacting support please provide the following
				information:<br/>Server response: {patreon_message}<br/>Server
				error code: {patreon_error}
			</p>
		</div>
	{:else if patreon_result === "success"}
		<div class="highlight_green">
			Success! Your Patreon pledge has been linked to your pixeldrain
			account. You are now able to use Pro features.
		</div>
	{/if}
	<br/>
{/if}

<style>
.highlight_red, .highlight_yellow {
	text-align: initial;
}
</style>
