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
	{#if patreon_result === "error"}
		<div class="highlight_red">
			An error occurred while linking Patreon subscription. Please try
			again later.
		</div>
		<p>
			If it has been more than 30 minutes, your payment is complete and
			the upgrade still fails please contact me on Patreon or through
			e-mail at support@pixeldrain.com.
		<p/>
		<p>
			When contacting support please provide the following information:<br/>
			Server response: {patreon_message}<br/>
			Server error code: {patreon_error}
		</p>
	{:else if patreon_result === "pledge_not_found"}
		<div class="highlight_yellow">
			<p>
				We were not able to find your payment on Patreon. Please
				wait until the payment is confirmed and try again. Even if
				the payment says confirmed on Patreon itself it takes a
				while before it's communicated to pixeldrain. Please wait at
				least 10 minutes and try again.
			</p>
			<p>
				If it has been more than 30 minutes, your payment is complete
				and the upgrade still fails please contact me on Patreon or
				through e-mail at support@pixeldrain.com.
			<p/>
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
