<script>
import { onMount } from "svelte"

let ad_type = ""

onMount(() => {
	// 40% pixeldrain socials
	// 10% reviews
	// 50% patreon

	// let rand = Math.random()
	// if (rand < 0.4) {
	// 	ad_type = "socials"
	// } else if (rand < 0.5) {
	// 	ad_type = "reviews"
	// } else {
	// 	ad_type = "patreon_support"
	// }
})
</script>

{#if ad_type === "patreon_support"}

	<div class="banner support_banner">
		<span style="display: block; margin-bottom: 2px;">
			No ads today. Pixeldrain is currently funded by our subscribers!
		</span>
		<a href="/#pro" rel="noreferrer" class="button button_highlight" target="_blank">
			<i class="icon">bolt</i>
			Support Pixeldrain to help keep the project going
		</a>
	</div>

{:else if ad_type === "socials"}

	<div class="banner center">
		<div class="socials">
			Pixeldrain on social media<br/>

			<a href="https://mastodon.social/@fornax" rel="noreferrer" class="button" target="_blank" style="background-color: #595aff; color: #ffffff;">
				<i class="icon small">people</i>
				Mastodon
			</a>
			<a href="https://bsky.app/profile/fornax.bsky.social"
				rel="noreferrer" class="button" target="_blank" style="background-color: #208bfe; color: #ffffff;"
			>
				<i class="icon small">people</i>
				Bluesky
			</a>
			<a href="https://discord.gg/TWKGvYAFvX" rel="noreferrer" class="button" target="_blank" style="background-color: #5b5eee; color: #ffffff;">
				<i class="icon small">people</i>
				Discord
			</a>
			<a href="https://www.reddit.com/r/PixelDrain"
				rel="noreferrer" class="button" target="_blank" style="background-color: #ff4500; color: #ffffff;"
			>
				<i class="icon small">people</i>
				Reddit
			</a>
		</div>
	</div>

{:else if ad_type === "reviews"}

	<div class="banner support_banner">
		<span style="display: block; margin-bottom: 2px;">
			Are you liking pixeldrain? Write a review! It really helps
		</span>
		<a href="https://alternativeto.net/software/pixeldrain/about/"
			rel="noreferrer" class="button" target="_blank" style="background-color: #0C9EF0; color: #FFFFFF; font-weight: bold;"
		>
			<i class="icon">rate_review</i>
			AlternativeTo
		</a>
		<a href="https://www.trustpilot.com/review/pixeldrain.com"
			rel="noreferrer" class="button" target="_blank" style="background-color: #00B67A; color: #FFFFFF; font-weight: bold;"
		>
			<i class="icon">rate_review</i>
			Trustpilot
		</a>
	</div>

{:else if ad_type === "ad_block"}

	<div class="banner support_banner">
		<span style="display: block; margin-bottom: 2px;">
			Protect your privacy, protect your sanity. Get an ad blocker!
		</span>
		<a href="https://ublockorigin.com/"
			rel="noreferrer" class="button" target="_blank" style="background-color: #800000; color: #FFFFFF; font-weight: bold;"
		>
			<i class="icon">security</i>
			Get uBlock Origin
		</a>
	</div>

{/if}

<style>
.banner {
	display: block;
	margin: auto;
	transform-origin: 0 0;
	font-size: 1.2em;
	line-height: 1.2em;
}
.center {
	text-align: center;
}
.support_banner {
	text-align: center;
	padding: 2px;
}
.socials {
	display: inline-block;
	text-align: center;
	margin: 0 5px;
}

/* Try to avoid text wrapping */
@media(max-width: 600px) {
	.banner {
		font-size: 1em;
	}
	.socials {
		font-size: 0.9em;
	}
}
</style>
