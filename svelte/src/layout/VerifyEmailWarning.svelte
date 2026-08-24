{#if window.user.username !== "" && !window.user.can_upload}
	<div class="highlight_yellow">
		{#if window.user.email_address_pending !== ""}
			Your e-mail address {window.user.email_address_pending} is not
			verified yet. You can't upload files until you have clicked the
			verification link we sent you.
		{:else}
			Your account does not have a verified e-mail address yet. You won't
			be able to upload files until you add one on the
			<a href="/user/settings">settings page</a> and verify it.
		{/if}
	</div>
{/if}
