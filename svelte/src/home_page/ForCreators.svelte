<script>
import MollieDeposit from "../user_home/MollieDeposit.svelte";
import Euro from "../util/Euro.svelte";
</script>

<header id="prepaid">
	<div class="header_image_container"></div>
</header>

<section>
	<h2>Prepaid</h2>
	<p>
		Whether you're working with large video files, high quality photography
		or a different kind of media. Pixeldrain is the best way to transfer
		files to your customers! With prepaid you only pay for what you use. No
		money wasted.
	</p>
	<br/>

	<img src="/res/img/misc/sunrise.webp" class="float_right" alt="Sunrise">
	<h2>Simple and affordable pricing</h2>
	<ul>
		<li><span class="keyword">€4.00 per TB per month</span> for storage</li>
		<li><span class="keyword">€1.00 per TB</span> for downloading and sharing files</li>
	</ul>

	<br style="clear: right;"/>
	<br/>

	<img src="/res/img/misc/branding.webp" class="float_left" alt="Download page branding">
	<h2 style="clear: right;">Customizable</h2>
	<p>
		<span class="keyword">Downloading files doesn't have to be
		dull.</span> Pixeldrain allows you to customize the look of
		your download pages. Transfer files to your customers in
		style! We also allow you to link directly to the file itself
		and circumvent the download page completely.
	</p>
	<br style="clear: both;"/>
	<h2>Get started</h2>
	{#if window.user.username !== ""}
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
				You are currently logged in as {window.user.username}. Use the
				form below to activate a prepaid subscription on this account.
			</p>
			<MollieDeposit/>
		{/if}
	{:else}
		<p>
			You are currently not logged in to a pixeldrain account. Log in to
			get started.
		</p>
		<p style="text-align: center;">
			<a href="/login?redirect=checkout" class="button button_highlight" style="font-size: 1.2em">
				<i class="icon">login</i>
				Log in
			</a>
			or
			<a href="/register?redirect=checkout" class="button button_highlight" style="font-size: 1.2em">
				<i class="icon">how_to_reg</i>
				Register
			</a>
		</p>
	{/if}
</section>


<style>
/* Override the default background with something spectacular */
header {
	background-image: url("/res/img/servers.webp");
	background-repeat: no-repeat;
	background-attachment: fixed;
	background-position: center;
	background-size: cover;
	background-blend-mode: normal;
}
.header_image_container {
	margin: auto;
	height: 250px;
	width: 750px;
	max-width: 100%;
	background-image: url("/res/img/professional_header.webp");
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}
.keyword {
	font-weight: bold;
}
h2 {
	border-bottom: none;
}
.float_left, .float_right {
	max-width: 45%;
	margin: 4px;
	border-radius: 12px;
}
.float_left {
	float: left;
	margin-right: 16px;
}
.float_right {
	float: right;
	margin-left: 16px;
}
</style>
