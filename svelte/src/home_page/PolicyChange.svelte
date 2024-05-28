<script>
import Expandable from "../util/Expandable.svelte";
</script>

<section>
	<Expandable click_expand>
		<div slot="header" class="header">
			Important policy change! Click to expand
		</div>
		<p>
			Sometime this summer pixeldrain will start requiring you to be
			logged in to an account in order to upload new files. This is
			necessary due to the large amount of regional blockings that have
			been implemented against pixeldrain recently.
		</p>
		<p>
			None of the countries that have blocked pixeldrain have specified a
			valid reason, nor have I been able to contact them to ask what's
			going on. But I can only guess that it has something to do with
			abusive content being uploaded. Pixeldrain currently uses an IP
			address banning system for restricting uploads from users who have
			violated the content policy, but at the scale the site operates at
			now that has proven to not be effective anymore. For that reason
			pixeldrain will be switching to an account ban system.
		</p>
		<p>
			The account ban system will restrict file uploads to your account
			for a certain amount of time which depends on the type of the
			offence. Serious violations might get your account banned for up to
			a year, minor violations maybe a day or a week per file. It will
			depend on the amount of abuse that slips through. Once the account
			ban system is activated the IP ban system will be disabled.
		</p>
		<p>
			Account banning is only effective if there is some system in place
			to prevent the automated creation of accounts. There is already a
			CAPTCHA in place on the registration page. I might start requiring
			e-mail addresses for new accounts as well. The lack of an e-mail
			address requirement has caused many issues with lost accounts as
			well, so it had to happen anyway. I will also be looking into
			integrating with OAuth providers (Google, Microsoft, Facebook,
			Patreon, etc) to make the login flow simpler for newcomers.
		</p>
		<p>
			After the site has been cleaned up it might take a long time before
			all the regional blocking issues are resolved. Because of that I
			will be adding alternative domain names for premium subscribers to
			use. Most of the blocks are only on DNS level, which means they can
			be circumvented by using a different domain name.
		</p>
	</Expandable>
</section>

<style>
.header {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	border-radius: 6px;
	background-color: rgba(0, 0, 255, 0.2);
}
</style>
